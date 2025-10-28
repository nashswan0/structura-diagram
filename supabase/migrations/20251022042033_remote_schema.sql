revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

revoke delete on table "public"."user_tokens" from "anon";

revoke insert on table "public"."user_tokens" from "anon";

revoke references on table "public"."user_tokens" from "anon";

revoke select on table "public"."user_tokens" from "anon";

revoke trigger on table "public"."user_tokens" from "anon";

revoke truncate on table "public"."user_tokens" from "anon";

revoke update on table "public"."user_tokens" from "anon";

revoke delete on table "public"."user_tokens" from "authenticated";

revoke insert on table "public"."user_tokens" from "authenticated";

revoke references on table "public"."user_tokens" from "authenticated";

revoke select on table "public"."user_tokens" from "authenticated";

revoke trigger on table "public"."user_tokens" from "authenticated";

revoke truncate on table "public"."user_tokens" from "authenticated";

revoke update on table "public"."user_tokens" from "authenticated";

revoke delete on table "public"."user_tokens" from "service_role";

revoke insert on table "public"."user_tokens" from "service_role";

revoke references on table "public"."user_tokens" from "service_role";

revoke select on table "public"."user_tokens" from "service_role";

revoke trigger on table "public"."user_tokens" from "service_role";

revoke truncate on table "public"."user_tokens" from "service_role";

revoke update on table "public"."user_tokens" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.consume_token(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_tokens INTEGER;
  is_user_admin BOOLEAN;
BEGIN
  SELECT public.is_admin(user_uuid) INTO is_user_admin;
  
  IF is_user_admin THEN
    RETURN TRUE;
  END IF;
  
  SELECT tokens_remaining INTO current_tokens
  FROM public.user_tokens
  WHERE user_id = user_uuid;
  
  IF current_tokens IS NULL OR current_tokens <= 0 THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_tokens
  SET tokens_remaining = tokens_remaining - 1
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- ⚠️ CHANGE THIS EMAIL TO YOUR OWN!
  IF NEW.email = 'nashwanzaki19@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  -- Initialize tokens
  INSERT INTO public.user_tokens (user_id, tokens_remaining)
  VALUES (NEW.id, 10);
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.has_role(_user_id, 'admin')
$function$
;

CREATE OR REPLACE FUNCTION public.reset_daily_tokens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_tokens
  SET 
    tokens_remaining = 10,
    last_reset = NOW()
  WHERE tokens_remaining < 10;
END;
$function$
;



