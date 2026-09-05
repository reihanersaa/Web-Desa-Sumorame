BEGIN;

CREATE TABLE IF NOT EXISTS public.login_throttle (
  key_hash text PRIMARY KEY CHECK (char_length(key_hash) BETWEEN 67 AND 140),
  failure_count integer NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_throttle_updated_idx ON public.login_throttle (updated_at);
ALTER TABLE public.login_throttle ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.login_throttle FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.login_throttle TO service_role;

CREATE OR REPLACE FUNCTION public.check_login_throttle(p_keys text[])
RETURNS TABLE(allowed boolean, retry_after integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
DECLARE seconds_left integer;
BEGIN
  IF coalesce(array_length(p_keys, 1), 0) < 1 OR array_length(p_keys, 1) > 3 THEN
    RAISE EXCEPTION 'invalid keys';
  END IF;
  SELECT coalesce(max(ceil(extract(epoch FROM (blocked_until - clock_timestamp())))::integer), 0)
    INTO seconds_left
    FROM public.login_throttle
   WHERE key_hash = ANY(p_keys) AND blocked_until > clock_timestamp();
  RETURN QUERY SELECT seconds_left <= 0, greatest(seconds_left, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_login_failure(
  p_keys text[], p_limits integer[], p_block_seconds integer DEFAULT 120
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
DECLARE i integer; now_at timestamptz := clock_timestamp(); current_count integer;
BEGIN
  IF coalesce(array_length(p_keys, 1), 0) < 1 OR array_length(p_keys, 1) > 3
     OR array_length(p_keys, 1) <> array_length(p_limits, 1)
     OR p_block_seconds < 30 OR p_block_seconds > 3600 THEN
    RAISE EXCEPTION 'invalid throttle parameters';
  END IF;
  FOR i IN 1..array_length(p_keys, 1) LOOP
    IF p_limits[i] < 1 OR p_limits[i] > 100 THEN RAISE EXCEPTION 'invalid limit'; END IF;
    INSERT INTO public.login_throttle(key_hash, failure_count, window_started_at, blocked_until, updated_at)
    VALUES (p_keys[i], 1, now_at, NULL, now_at)
    ON CONFLICT (key_hash) DO UPDATE SET
      failure_count = CASE
        WHEN login_throttle.blocked_until > now_at THEN login_throttle.failure_count
        WHEN login_throttle.window_started_at <= now_at - make_interval(secs => p_block_seconds) THEN 1
        ELSE login_throttle.failure_count + 1 END,
      window_started_at = CASE
        WHEN login_throttle.window_started_at <= now_at - make_interval(secs => p_block_seconds) THEN now_at
        ELSE login_throttle.window_started_at END,
      blocked_until = CASE
        WHEN login_throttle.blocked_until > now_at THEN login_throttle.blocked_until
        WHEN (CASE WHEN login_throttle.window_started_at <= now_at - make_interval(secs => p_block_seconds)
                   THEN 1 ELSE login_throttle.failure_count + 1 END) >= p_limits[i]
          THEN now_at + make_interval(secs => p_block_seconds)
        ELSE NULL END,
      updated_at = now_at;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_login_failures(p_keys text[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
BEGIN
  IF coalesce(array_length(p_keys, 1), 0) < 1 OR array_length(p_keys, 1) > 2 THEN
    RAISE EXCEPTION 'invalid keys';
  END IF;
  DELETE FROM public.login_throttle WHERE key_hash = ANY(p_keys);
END;
$$;

REVOKE ALL ON FUNCTION public.check_login_throttle(text[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_login_failure(text[], integer[], integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.clear_login_failures(text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_login_throttle(text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_login_failure(text[], integer[], integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_login_failures(text[]) TO service_role;

-- Optional periodic cleanup; safe to run manually or from Supabase Cron.
DELETE FROM public.login_throttle WHERE updated_at < now() - interval '7 days';

COMMIT;
