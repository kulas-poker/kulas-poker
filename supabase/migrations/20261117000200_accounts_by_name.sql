-- Players are recognised by their full name, not by the browser.
-- The same name typed on another phone (or after clearing the browser) is the same account:
-- same seat, same chips, same ranking. A new name is a new account.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name_key text not null unique,          -- lower-case, single spaces, Polish letters without accents
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security; -- no policies: only the game server reads it

alter table public.members add column if not exists account uuid;

-- people who already played: one account per name, keeping the id they already play under
-- (so their seat, ranking and photo stay). If a name has several devices, the one seated at the table wins.
insert into public.accounts (id, name_key, name)
select distinct on (k) uid, k, name
from (
  select m.uid, m.name, m.joined_at,
         translate(lower(regexp_replace(trim(m.name), '\s+', ' ', 'g')), 'ąćęłńóśźż', 'acelnoszz') as k,
         exists (select 1 from public.games g, jsonb_array_elements(coalesce(g.state->'players', '[]'::jsonb)) p
                 where g.id = 'main' and p->>'id' = m.uid::text) as seated
  from public.members m
  where m.name <> 'Gość'
) x
order by k, seated desc, joined_at desc
on conflict do nothing;

update public.members m set account = a.id
from public.accounts a
where m.account is null
  and m.name <> 'Gość'
  and a.name_key = translate(lower(regexp_replace(trim(m.name), '\s+', ' ', 'g')), 'ąćęłńóśźż', 'acelnoszz');

-- the account the signed-in device belongs to
create or replace function public.my_account() returns uuid
language sql stable security definer set search_path = public as $$
  select account from public.members where uid = auth.uid();
$$;
grant execute on function public.my_account() to authenticated;

-- own cards: readable from every device of the account
drop policy if exists "own cards" on public.hole_cards;
create policy "own cards" on public.hole_cards for select to authenticated
  using (player_id = auth.uid() or player_id = public.my_account());

-- photo and chat messages are signed with the account
drop policy if exists "photo insert" on public.profiles;
create policy "photo insert" on public.profiles for insert to authenticated
  with check ((uid = auth.uid() or uid = public.my_account()) and public.is_member());
drop policy if exists "photo update" on public.profiles;
create policy "photo update" on public.profiles for update to authenticated
  using (uid = auth.uid() or uid = public.my_account())
  with check (uid = auth.uid() or uid = public.my_account());

drop policy if exists "chat write" on public.chat;
create policy "chat write" on public.chat for insert to authenticated
  with check ((uid = auth.uid() or uid = public.my_account()) and public.is_member());
