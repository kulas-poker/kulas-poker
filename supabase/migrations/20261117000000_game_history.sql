-- KULAS POKER: history of finished games (date, players, results). Readable by everyone at the table,
-- written only by the game server, in the same transaction as the table state.

create table if not exists public.game_history (
  id bigint generated always as identity primary key,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  hands int not null default 0,
  players jsonb not null
);
alter table public.game_history enable row level security;
drop policy if exists "history read" on public.game_history;
create policy "history read" on public.game_history for select to authenticated using (public.is_member());

drop function if exists public.save_game(text, bigint, jsonb, jsonb, jsonb);
create or replace function public.save_game(p_id text, p_expected bigint, p_state jsonb, p_secret jsonb, p_holes jsonb, p_archive jsonb)
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
  if p_archive is not null then
    insert into game_history(started_at, ended_at, hands, players)
    values (to_timestamp((p_archive->>'startedAt')::double precision / 1000),
            to_timestamp((p_archive->>'endedAt')::double precision / 1000),
            coalesce((p_archive->>'hands')::int, 0), p_archive->'players');
  end if;
  return v;
end $$;
revoke all on function public.save_game(text, bigint, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;

do $$ begin
  begin alter publication supabase_realtime add table public.game_history; exception when duplicate_object then null; end;
end $$;
