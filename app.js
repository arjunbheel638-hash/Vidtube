
create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  category text not null default 'Entertainment',
  storage_path text not null unique,
  video_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  video_id uuid references public.videos(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

create policy "Read videos"
on public.videos for select using (true);

create policy "Upload own video records"
on public.videos for insert to authenticated
with check (auth.uid() = user_id);

create policy "Read likes"
on public.likes for select using (true);

create policy "Add own likes"
on public.likes for insert to authenticated
with check (auth.uid() = user_id);

create policy "Remove own likes"
on public.likes for delete to authenticated
using (auth.uid() = user_id);

create policy "Read comments"
on public.comments for select using (true);

create policy "Add own comments"
on public.comments for insert to authenticated
with check (auth.uid() = user_id);

create policy "Delete own comments"
on public.comments for delete to authenticated
using (auth.uid() = user_id);

