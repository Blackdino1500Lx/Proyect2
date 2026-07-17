-- ============================================================
--  Pizarra Digital Vista Grande - Esquema COMPLETO
--  Esquema aislado: "pizarra"  (no choca con otras tablas)
--  Ejecutar en:  Supabase > tu proyecto > SQL Editor > New query
--  Pega TODO y presiona "Run".
--
--  ⚠️  PASO OBLIGATORIO en el dashboard (si no, la API da error):
--    Project Settings > API > Data API > Exposed schemas
--    -> agrega "pizarra" y guarda.
-- ============================================================

-- 0) Esquema aislado -----------------------------------------
create schema if not exists pizarra;
grant usage on schema pizarra to anon, authenticated, service_role;

-- ============================================================
--  TABLAS
--  (orden importa por las llaves foráneas)
-- ============================================================

-- Grupos -----------------------------------------------------
create table if not exists pizarra.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  captain    text,
  created_at timestamptz default now()
);

-- Usuarios (perfil ligado a Supabase Auth) -------------------
create table if not exists pizarra.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  role       text not null default 'user' check (role in ('admin','user')),
  group_id   uuid references pizarra.groups(id) on delete set null,
  gender     text,                       -- 'brother' / 'sister'
  baptized   boolean default false,
  school     boolean default false,
  created_at timestamptz default now()
);

-- Reuniones entre semana -------------------------------------
create table if not exists pizarra.meeting_weeks (
  id            uuid primary key default gen_random_uuid(),
  date_range    text unique,
  bible_reading text,
  opening_song  text,
  mid_song      text,
  closing_song  text,
  sections      jsonb,
  assignments   jsonb default '{}'::jsonb,
  roles         jsonb default '{}'::jsonb,
  sort_order    int  default 0,
  updated_at    timestamptz default now(),
  created_at    timestamptz default now()
);

-- Reuniones fin de semana ------------------------------------
create table if not exists pizarra.weekend_meetings (
  id               uuid primary key default gen_random_uuid(),
  meeting_date     date unique,
  opening_song     text,
  mid_song         text,
  watchtower_song  text,
  closing_song     text,
  presidente       text,
  oracion_apertura text,
  oracion_cierre   text,
  talk_theme       text,
  talk_speaker     text,
  study_theme      text,
  study_conductor  text,
  study_reader     text,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

-- Territorios ------------------------------------------------
create table if not exists pizarra.territories (
  id           uuid primary key default gen_random_uuid(),
  number       text,
  name         text,
  total_points int  default 0,
  last_point   int  default 0,
  status       text not null default 'available'
               check (status in ('available','in-progress','completed')),
  last_worked  date,
  created_at   timestamptz default now()
);

-- Programa de predicación de la semana -----------------------
create table if not exists pizarra.field_schedule (
  id           uuid primary key default gen_random_uuid(),
  week_start   date,
  day_date     date,
  captain      text,
  exit_point   text,
  territory_id uuid references pizarra.territories(id) on delete set null,
  notes        text,
  created_at   timestamptz default now()
);

-- Zoom de la semana ------------------------------------------
create table if not exists pizarra.zoom_schedule (
  id         uuid primary key default gen_random_uuid(),
  week_start date,
  day_date   date,
  time       text,
  captain    text,
  link       text,
  notes      text,
  created_at timestamptz default now(),
  unique (week_start, day_date)
);

-- Avance de territorios --------------------------------------
create table if not exists pizarra.territory_progress (
  id           uuid primary key default gen_random_uuid(),
  territory_id uuid references pizarra.territories(id) on delete cascade,
  schedule_id  uuid references pizarra.field_schedule(id) on delete set null,
  from_point   int,
  to_point     int,
  worked_date  date,
  created_at   timestamptz default now()
);

-- Configuración de la app (clave/valor) ----------------------
create table if not exists pizarra.app_settings (
  key   text primary key,
  value text
);

-- Informes de predicación ------------------------------------
create table if not exists pizarra.reports (
  email      text,
  year       int,
  month      int,
  hours      int default 0,
  revisits   int default 0,
  studies    int default 0,
  videos     int default 0,
  notes      text,
  created_at timestamptz default now(),
  primary key (email, year, month)
);

-- Anuncios ---------------------------------------------------
create table if not exists pizarra.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  body       text,
  priority   text,
  created_at timestamptz default now()
);

-- Aseo / limpieza --------------------------------------------
create table if not exists pizarra.cleaning (
  id         uuid primary key default gen_random_uuid(),
  who        text,
  date       date,
  notes      text,
  group_id   uuid references pizarra.groups(id) on delete set null,
  created_at timestamptz default now()
);

-- Programa de trabajo / mantenimiento ------------------------
create table if not exists pizarra.workprogram (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  date       date,
  who        text,
  notes      text,
  created_at timestamptz default now()
);

-- Passkeys (login biométrico WebAuthn) -----------------------
create table if not exists pizarra.passkeys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references pizarra.users(id) on delete cascade,
  credential_id text unique,
  public_key    text,
  counter       int default 0,
  device_name   text,
  created_at    timestamptz default now()
);

-- Suscripciones de notificaciones push -----------------------
create table if not exists pizarra.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references pizarra.users(id) on delete cascade,
  endpoint   text,
  p256dh     text,
  auth       text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
--  FUNCIONES
-- ============================================================

-- Alta automática de perfil al registrarse en Auth
create or replace function pizarra.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pizarra, public
as $$
begin
  insert into pizarra.users (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function pizarra.handle_new_user();

-- ¿El usuario actual es admin?  (security definer -> evita recursión RLS)
create or replace function pizarra.es_admin()
returns boolean
language sql
security definer
stable
set search_path = pizarra, public
as $$
  select exists (
    select 1 from pizarra.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Login biométrico: buscar el usuario por credential_id
-- (se llama ANTES de estar logueado -> security definer + accesible a anon)
create or replace function pizarra.get_passkey_user(cred_id text)
returns json
language sql
security definer
stable
set search_path = pizarra, public
as $$
  select json_build_object('user_id', p.user_id, 'email', u.email)
  from pizarra.passkeys p
  join pizarra.users u on u.id = p.user_id
  where p.credential_id = cred_id
  limit 1;
$$;

-- ============================================================
--  PERMISOS de tabla / función para los roles de la API
-- ============================================================
grant all on all tables in schema pizarra to authenticated, service_role;
grant execute on function pizarra.get_passkey_user(text) to anon, authenticated, service_role;
grant execute on function pizarra.es_admin() to authenticated, service_role;

alter default privileges in schema pizarra grant all on tables to authenticated, service_role;

-- ============================================================
--  SEGURIDAD POR FILAS (RLS)
--    Regla general:
--      - Leer: cualquier usuario logueado (la app va tras login)
--      - Escribir: solo ADMIN
--    Excepciones: users, reports, passkeys, push_subscriptions
-- ============================================================

-- Helper para aplicar el patrón "leer logueado / escribir admin"
do $$
declare t text;
begin
  foreach t in array array[
    'groups','meeting_weeks','weekend_meetings','territories',
    'field_schedule','zoom_schedule','territory_progress',
    'app_settings','announcements','cleaning','workprogram'
  ]
  loop
    execute format('alter table pizarra.%I enable row level security;', t);
    execute format($f$create policy "leer logueado" on pizarra.%I
                     for select to authenticated using (true);$f$, t);
    execute format($f$create policy "escribir admin" on pizarra.%I
                     for all to authenticated
                     using (pizarra.es_admin()) with check (pizarra.es_admin());$f$, t);
  end loop;
end $$;

-- users: todos ven la lista; cada quien edita lo suyo, admin edita todo
alter table pizarra.users enable row level security;
create policy "users leer logueado" on pizarra.users
  for select to authenticated using (true);
create policy "users insertar propio o admin" on pizarra.users
  for insert to authenticated with check (id = auth.uid() or pizarra.es_admin());
create policy "users editar propio o admin" on pizarra.users
  for update to authenticated
  using (id = auth.uid() or pizarra.es_admin())
  with check (id = auth.uid() or pizarra.es_admin());
create policy "users borrar admin" on pizarra.users
  for delete to authenticated using (pizarra.es_admin());

-- reports: cada publicador ve/edita el suyo; admin ve/edita todos
alter table pizarra.reports enable row level security;
create policy "reports propio o admin" on pizarra.reports
  for all to authenticated
  using (email = (auth.jwt() ->> 'email') or pizarra.es_admin())
  with check (email = (auth.jwt() ->> 'email') or pizarra.es_admin());

-- passkeys: cada quien gestiona las suyas
alter table pizarra.passkeys enable row level security;
create policy "passkeys propias" on pizarra.passkeys
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- push_subscriptions: cada quien gestiona la suya
alter table pizarra.push_subscriptions enable row level security;
create policy "push propias" on pizarra.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
--  PASO FINAL (después de crear tu usuario en Authentication):
--  Conviértete en admin reemplazando el correo:
--
--    update pizarra.users set role = 'admin'
--    where email = 'tu@correo.com';
-- ============================================================
