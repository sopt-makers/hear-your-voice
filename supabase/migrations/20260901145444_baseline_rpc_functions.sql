-- Baseline snapshot of application RPC functions (public schema).
-- Captured from the live production database and verified against docs/2-database.md.

-- =========================================================
-- Frontend RPC
-- =========================================================

CREATE OR REPLACE FUNCTION public.has_active_sprint()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_exists boolean;
begin
    select exists (
        select 1
        from sprints
        where current_date between start_date and end_date
    )
    into v_exists;

    return v_exists;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_sprint_info_by_code(p_auth_code text)
 RETURNS sprint_check_result
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_result sprint_check_result;
begin
    select
        true,
        type,
        name
    into v_result
    from sprints
    where auth_code = p_auth_code
      and current_date between start_date and end_date
    limit 1;

    if v_result is null then
        v_result := (false, null);
    end if;

    return v_result;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_chapter_codes()
 RETURNS TABLE(code character varying, name character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    return query
    select c.code, c.name
    from codes c
    where c.code_group = 'chapter'
    order by c.code;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_team_codes()
 RETURNS TABLE(code character varying, name character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    return query
    select c.code, c.name
    from codes c
    where c.code_group = 'team'
    order by c.code;
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_valid_user(p_name text, p_team_code text, p_chapter_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_exists boolean;
begin
    select exists (
        select 1
        from users
        where name = p_name
          and team_code = p_team_code
          and chapter_code = p_chapter_code
    )
    into v_exists;

    return v_exists;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_users_by_sprint(
  p_auth_code text,
  p_name text,
  p_team_code text,
  p_chapter_code text
)
 RETURNS TABLE(id bigint, name text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    select u.id, u.name
    from users u
    join sprints s on s.auth_code = p_auth_code
    where current_date between s.start_date and s.end_date
      and (
        (s.type = 'team' and u.team_code = p_team_code)
        or
        (s.type = 'chapter' and u.chapter_code = p_chapter_code)
      )
      and u.name <> p_name;
$function$;

CREATE OR REPLACE FUNCTION public.submit_comments(p_payload jsonb)
 RETURNS api_write_result
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_sender_id bigint;
    v_sprint_id bigint;
    v_item jsonb;
begin
    select id into v_sender_id
    from users
    where name = p_payload->>'user_name'
      and team_code = p_payload->>'user_team'
      and chapter_code = p_payload->>'user_chapter'
    limit 1;

    if v_sender_id is null then
        return (false, 'USER_NOT_FOUND'::text, '사용자를 찾을 수 없습니다'::text);
    end if;

    select id into v_sprint_id
    from sprints
    where auth_code = p_payload->>'p_sprint_auth_code'
      and current_date between start_date and end_date
    limit 1;

    if v_sprint_id is null then
        return (false, 'INVALID_SPRINT'::text, '유효하지 않은 스프린트입니다'::text);
    end if;

    if p_payload ? 'stop_comments' and p_payload->'stop_comments' is not null then
        for v_item in
            select * from jsonb_array_elements(p_payload->'stop_comments')
        loop
            insert into comments (sprint_id, sender_id, target_user_id, type, content)
            values (
                v_sprint_id,
                v_sender_id,
                (v_item->>'target_user_id')::bigint,
                'stop',
                v_item->>'comment_text'
            );
        end loop;
    end if;

    if p_payload ? 'start_comments' and p_payload->'start_comments' is not null then
        for v_item in
            select * from jsonb_array_elements(p_payload->'start_comments')
        loop
            insert into comments (sprint_id, sender_id, target_user_id, type, content)
            values (
                v_sprint_id,
                v_sender_id,
                (v_item->>'target_user_id')::bigint,
                'start',
                v_item->>'comment_text'
            );
        end loop;
    end if;

    if p_payload ? 'continue_comments' and p_payload->'continue_comments' is not null then
        for v_item in
            select * from jsonb_array_elements(p_payload->'continue_comments')
        loop
            insert into comments (sprint_id, sender_id, target_user_id, type, content)
            values (
                v_sprint_id,
                v_sender_id,
                (v_item->>'target_user_id')::bigint,
                'continue',
                v_item->>'comment_text'
            );
        end loop;
    end if;

    if p_payload ? 'mvp' and p_payload->'mvp' is not null then
        insert into comments (sprint_id, sender_id, target_user_id, type, content)
        values (
            v_sprint_id,
            v_sender_id,
            (p_payload->'mvp'->>'target_user_id')::bigint,
            'mvp',
            p_payload->'mvp'->>'comment_text'
        );
    end if;

    return (true, 'SUCCESS'::text, '피드백 제출 완료'::text);

exception
    when others then
        return (false, 'UNKNOWN_ERROR'::text, SQLERRM::text);
end;
$function$;

-- =========================================================
-- Ops automation RPC — Notion sync
-- =========================================================

-- Updated 2026-09-01 (issue #52): removed the notion_retry_deadline dependency,
-- which was never populated anywhere and permanently excluded sprints from sync.
-- Attempt cap raised 3 -> 10.
CREATE OR REPLACE FUNCTION public.get_sprints_for_notion_delivery(p_run_date date)
 RETURNS TABLE(id bigint, name text)
 LANGUAGE sql
AS $function$
  SELECT id, name
  FROM sprints
  WHERE end_date <= p_run_date - interval '1 day'
    AND notion_sync_status IN ('pending', 'failed')
    AND notion_sync_attempt_count < 10
    AND (
      notion_last_attempted_at IS NULL
      OR timezone('Asia/Seoul', notion_last_attempted_at)::date < p_run_date
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_comments_for_sprint(p_sprint_id integer)
 RETURNS TABLE(type text, content text, sender_id integer, sender_name text, target_name text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    select
      c.type::text,
      c.content,
      s.id as sender_id,
      s.name::text as sender_name,
      t.name::text as target_name
    from comments c
    join users s on s.id = c.sender_id
    join users t on t.id = c.target_user_id
    where c.sprint_id = p_sprint_id;
$function$;

CREATE OR REPLACE FUNCTION public.mark_sprint_notion_synced(p_sprint_id bigint)
 RETURNS void
 LANGUAGE sql
AS $function$
  UPDATE sprints
  SET
    notion_sync_status        = 'synced',
    notion_synced_at          = now(),
    notion_last_error         = NULL,
    notion_sync_attempt_count = notion_sync_attempt_count + 1,
    notion_last_attempted_at  = now()
  WHERE id = p_sprint_id;
$function$;

-- Updated 2026-09-01 (issue #52): dropped the notion_retry_deadline check for the
-- same reason as get_sprints_for_notion_delivery above. Attempt cap raised 3 -> 10.
CREATE OR REPLACE FUNCTION public.mark_sprint_notion_failed(
  p_sprint_id bigint,
  p_error text,
  p_run_date date
)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_new_count  integer;
  v_new_status text;
BEGIN
  SELECT notion_sync_attempt_count + 1
  INTO   v_new_count
  FROM   sprints
  WHERE  id = p_sprint_id;

  IF v_new_count >= 10 THEN
    v_new_status := 'expired';
  ELSE
    v_new_status := 'failed';
  END IF;

  UPDATE sprints
  SET
    notion_sync_status        = v_new_status,
    notion_sync_attempt_count = v_new_count,
    notion_last_attempted_at  = now(),
    notion_last_error         = p_error
  WHERE id = p_sprint_id;
END;
$function$;

-- =========================================================
-- Ops automation RPC — Slack DM queue
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_sprints_for_dm_enqueue(p_run_date date)
 RETURNS TABLE(id bigint, name text, retry_deadline_date date)
 LANGUAGE sql
AS $function$
  SELECT
    id,
    name,
    (end_date + interval '3 days')::date AS retry_deadline_date
  FROM sprints
  WHERE end_date = p_run_date - interval '1 day';
$function$;

CREATE OR REPLACE FUNCTION public.get_sprint_comment_rows(p_sprint_id bigint)
 RETURNS TABLE(target_user_id bigint, slack_user_name text, target_name text, type text, content text)
 LANGUAGE sql
AS $function$
  SELECT
    u.id              AS target_user_id,
    u.slack_user_name,
    u.name            AS target_name,
    c.type,
    c.content
  FROM comments c
  JOIN users    u ON u.id = c.target_user_id
  WHERE c.sprint_id = p_sprint_id;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_sprint_dm_delivery(
  p_sprint_id bigint,
  p_target_user_id bigint,
  p_target_name text,
  p_slack_user_name text,
  p_message_text text,
  p_next_retry_date date,
  p_retry_deadline_date date
)
 RETURNS void
 LANGUAGE sql
AS $function$
  INSERT INTO sprint_dm_deliveries (
    sprint_id,
    target_user_id,
    target_name,
    slack_user_name,
    message_text,
    next_retry_date,
    retry_deadline_date
  ) VALUES (
    p_sprint_id,
    p_target_user_id,
    p_target_name,
    p_slack_user_name,
    p_message_text,
    p_next_retry_date,
    p_retry_deadline_date
  )
  ON CONFLICT (sprint_id, target_user_id) DO NOTHING;
$function$;

CREATE OR REPLACE FUNCTION public.get_due_sprint_dm_deliveries(p_run_date date)
 RETURNS TABLE(id bigint, sprint_id bigint, target_user_id bigint, target_name text, slack_user_name text, message_text text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  UPDATE sprint_dm_deliveries
  SET
    status     = 'processing',
    updated_at = now()
  WHERE sprint_dm_deliveries.id IN (
    SELECT d.id
    FROM   sprint_dm_deliveries d
    WHERE  d.status IN ('pending', 'failed')
      AND  d.sent_at IS NULL
      AND  d.next_retry_date <= p_run_date
      AND  p_run_date <= d.retry_deadline_date
      AND  d.attempt_count < 3
    FOR UPDATE SKIP LOCKED
  )
  RETURNING
    sprint_dm_deliveries.id,
    sprint_dm_deliveries.sprint_id,
    sprint_dm_deliveries.target_user_id,
    sprint_dm_deliveries.target_name,
    sprint_dm_deliveries.slack_user_name,
    sprint_dm_deliveries.message_text;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recover_stale_processing_deliveries()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE sprint_dm_deliveries
  SET
    status   = 'sent',
    sent_at  = COALESCE(sent_at, now()),
    updated_at = now()
  WHERE status = 'processing'
    AND updated_at < now() - interval '1 hour'
    AND slack_message_ts IS NOT NULL;

  UPDATE sprint_dm_deliveries
  SET
    status     = 'failed',
    updated_at = now()
  WHERE status = 'processing'
    AND updated_at < now() - interval '1 hour'
    AND slack_message_ts IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.expire_sprint_dm_deliveries(p_run_date date)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE sprint_dm_deliveries
  SET
    status     = 'expired',
    updated_at = now()
  WHERE status IN ('pending', 'failed')
    AND retry_deadline_date < p_run_date;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_sprint_dm_sent(p_delivery_id bigint, p_slack_message_ts text)
 RETURNS void
 LANGUAGE sql
AS $function$
  UPDATE sprint_dm_deliveries
  SET
    status             = 'sent',
    sent_at            = now(),
    last_error         = NULL,
    slack_message_ts   = p_slack_message_ts,
    attempt_count      = attempt_count + 1,
    first_attempted_at = COALESCE(first_attempted_at, now()),
    last_attempted_at  = now(),
    updated_at         = now()
  WHERE id = p_delivery_id;
$function$;

CREATE OR REPLACE FUNCTION public.mark_sprint_dm_failed(
  p_delivery_id bigint,
  p_error text,
  p_next_retry_date date
)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_new_count  integer;
  v_deadline   date;
  v_new_status text;
BEGIN
  SELECT attempt_count + 1, retry_deadline_date
  INTO   v_new_count, v_deadline
  FROM   sprint_dm_deliveries
  WHERE  id = p_delivery_id;

  IF v_new_count >= 3 OR p_next_retry_date > v_deadline THEN
    v_new_status := 'expired';
  ELSE
    v_new_status := 'failed';
  END IF;

  UPDATE sprint_dm_deliveries
  SET
    status             = v_new_status,
    attempt_count      = v_new_count,
    first_attempted_at = COALESCE(first_attempted_at, now()),
    last_attempted_at  = now(),
    last_error         = p_error,
    next_retry_date    = p_next_retry_date,
    updated_at         = now()
  WHERE id = p_delivery_id;
END;
$function$;
