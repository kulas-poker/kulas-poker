-- Game history belongs to a table: the real one ('main') or the hidden test table used by the publishing robot.
alter table public.game_history add column if not exists table_id text not null default 'main';
create index if not exists game_history_table_ended on public.game_history (table_id, ended_at desc);

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
    insert into game_history(table_id, started_at, ended_at, hands, players)
    values (p_id,
            to_timestamp((p_archive->>'startedAt')::double precision / 1000),
            to_timestamp((p_archive->>'endedAt')::double precision / 1000),
            coalesce((p_archive->>'hands')::int, 0), p_archive->'players');
  end if;
  return v;
end $$;
revoke all on function public.save_game(text, bigint, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
