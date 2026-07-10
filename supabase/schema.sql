-- Schema usado pelo Memória Viva.
-- Execute no SQL Editor de um projeto Supabase novo. Em um projeto já configurado,
-- não reaplique sem antes revisar os objetos existentes.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  description text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  subtitle text,
  description text not null,
  category text not null,
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  image_url text,
  audio_url text,
  community text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  memory_id uuid references public.memories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, memory_id)
);

alter table public.profiles enable row level security;
alter table public.memories enable row level security;
alter table public.favorites enable row level security;

create policy "Profiles are publicly readable"
on public.profiles for select using (true);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Memories are publicly readable"
on public.memories for select using (true);

create policy "Authenticated users can create memories"
on public.memories for insert to authenticated
with check (auth.uid() = author_id);

create policy "Authors can update their memories"
on public.memories for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "Users can read their own favorites"
on public.favorites for select
using (auth.uid() = user_id);

create policy "Users can create their own favorites"
on public.favorites for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
on public.favorites for delete
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, description)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'Usuário'),
    nullif(new.raw_user_meta_data ->> 'description', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
