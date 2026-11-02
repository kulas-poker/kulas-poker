-- KULAS POKER: database schema
-- Everything is locked by Row Level Security. Players only read; the game state and the cards
-- are written exclusively by the server function (service role), which bypasses RLS.

-- People who entered the table code
create table if not exists public.members (
  uid uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  joined_at timestamptz not null default now()
);

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.members where uid = auth.uid());
$$;
grant execute on function public.is_member() to authenticated;

-- Public table state (no hidden cards in it)
create table if not exists public.games (
  id text primary key,
  state jsonb not null,
  version bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Hidden cards of the current hand: no policies, so only the server can read it
create table if not exists public.game_secrets (
  id text primary key references public.games(id) on delete cascade,
  secret jsonb
);

-- Each player's own two cards
create table if not exists public.hole_cards (
  table_id text not null,
  player_id uuid not null,
  hand_no int not null,
  cards text[] not null,
  primary key (table_id, player_id)
);

create table if not exists public.chat (
  id bigint generated always as identity primary key,
  uid uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 60),
  kind text not null check (kind in ('text','sticker','gif')),
  text text check (char_length(text) <= 500),
  sticker text check (char_length(sticker) <= 40),
  gif text check (char_length(gif) <= 300),
  at timestamptz not null default now()
);

create table if not exists public.profiles (
  uid uuid primary key default auth.uid(),
  photo text check (char_length(photo) <= 60000),
  updated_at timestamptz not null default now()
);

create table if not exists public.gif_library (
  path text primary key check (char_length(path) <= 300),
  added_by uuid not null default auth.uid(),
  at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.games enable row level security;
alter table public.game_secrets enable row level security;
alter table public.hole_cards enable row level security;
alter table public.chat enable row level security;
alter table public.profiles enable row level security;
alter table public.gif_library enable row level security;

drop policy if exists "members read" on public.members;
create policy "members read" on public.members for select to authenticated using (public.is_member());

drop policy if exists "games read" on public.games;
create policy "games read" on public.games for select to authenticated using (public.is_member());

drop policy if exists "own cards" on public.hole_cards;
create policy "own cards" on public.hole_cards for select to authenticated using (player_id = auth.uid());

drop policy if exists "chat read" on public.chat;
create policy "chat read" on public.chat for select to authenticated using (public.is_member());
drop policy if exists "chat write" on public.chat;
create policy "chat write" on public.chat for insert to authenticated with check (uid = auth.uid() and public.is_member());

drop policy if exists "photos read" on public.profiles;
create policy "photos read" on public.profiles for select to authenticated using (public.is_member());
drop policy if exists "photo insert" on public.profiles;
create policy "photo insert" on public.profiles for insert to authenticated with check (uid = auth.uid() and public.is_member());
drop policy if exists "photo update" on public.profiles;
create policy "photo update" on public.profiles for update to authenticated using (uid = auth.uid()) with check (uid = auth.uid());

drop policy if exists "gifs read" on public.gif_library;
create policy "gifs read" on public.gif_library for select to authenticated using (public.is_member());
drop policy if exists "gifs add" on public.gif_library;
create policy "gifs add" on public.gif_library for insert to authenticated with check (added_by = auth.uid() and public.is_member());

-- Atomic save used by the server: state + hidden cards (+ new hole cards) in one transaction,
-- only if nobody else changed the table in the meantime (optimistic locking).
create or replace function public.save_game(p_id text, p_expected bigint, p_state jsonb, p_secret jsonb, p_holes jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint; k text;
begin
  if p_expected = -1 then
    insert into games(id, state, version) values (p_id, p_state, 1) on conflict (id) do nothing;
    if not found then return null; end if;
    v := 1;
  else
    update games set state = p_state, version = version + 1, updated_at = now()
      where id = p_id and version = p_expected returning version into v;
    if v is null then return null; end if;
  end if;
  insert into game_secrets(id, secret) values (p_id, p_secret)
    on conflict (id) do update set secret = excluded.secret;
  if p_holes is not null then
    delete from hole_cards where table_id = p_id;
    for k in select jsonb_object_keys(p_holes->'cards') loop
      insert into hole_cards(table_id, player_id, hand_no, cards)
      values (p_id, k::uuid, (p_holes->>'handNo')::int,
              array(select jsonb_array_elements_text(p_holes->'cards'->k)));
    end loop;
  end if;
  return v;
end $$;
revoke all on function public.save_game(text, bigint, jsonb, jsonb, jsonb) from public, anon, authenticated;

-- Live updates
do $$ begin
  begin alter publication supabase_realtime add table public.games; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.chat; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.profiles; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.gif_library; exception when duplicate_object then null; end;
end $$;

-- Storage for GIFs (public read, members upload)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gifs', 'gifs', true, 20971520, array['image/gif','image/webp','image/png','image/jpeg','video/mp4'])
on conflict (id) do nothing;

drop policy if exists "gif upload" on storage.objects;
create policy "gif upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'gifs' and public.is_member());
