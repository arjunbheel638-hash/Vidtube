-- =========================================
-- VIDTUBE DATABASE
-- Supabase PostgreSQL
-- =========================================

create extension if not exists pgcrypto;

-- 1. USER PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text default '',
  created_at timestamptz default now()
);

-- 2. VIDEOS
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  video_url text not null,
  thumbnail_url text,
  views bigint default 0,
  created_at timestamptz default now()
);

-- 3. LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(video_id, user_id)
);

-- 4. COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- 5. SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references auth.users(id) on delete cascade not null,
  channel_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(subscriber_id, channel_id),
  check (subscriber_id <> channel_id)
);

-- 6. INDEXES
create index if not exists videos_created_at_idx
on public.videos(created_at desc);

create index if not exists videos_user_id_idx
on public.videos(user_id);

create index if not exists likes_video_id_idx
on public.likes(video_id);

create index if not exists comments_video_id_idx
on public.comments(video_id);

create index if not exists subscriptions_channel_id_idx
on public.subscriptions(channel_id);

-- 7. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.subscriptions enable row level security;

-- 8. PROFILE POLICIES
create policy "Profiles are publicly viewable"
on public.profiles for select
using (true);

create policy "Users create their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 9. VIDEO POLICIES
create policy "Videos are publicly viewable"
on public.videos for select
using (true);

create policy "Authenticated users upload videos"
on public.videos for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners update their videos"
on public.videos for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Owners delete their videos"
on public.videos for delete
to authenticated
using (auth.uid() = user_id);

-- 10. LIKE POLICIES
create policy "Likes are publicly viewable"
on public.likes for select
using (true);

create policy "Users add their own likes"
on public.likes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users remove their own likes"
on public.likes for delete
to authenticated
using (auth.uid() = user_id);

-- 11. COMMENT POLICIES
create policy "Comments are publicly viewable"
on public.comments for select
using (true);

create policy "Users add their own comments"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users delete their own comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

-- 12. SUBSCRIPTION POLICIES
create policy "Subscriptions are publicly viewable"
on public.subscriptions for select
using (true);

create policy "Users subscribe as themselves"
on public.subscriptions for insert
to authenticated
with check (auth.uid() = subscriber_id);

create policy "Users unsubscribe themselves"
on public.subscriptions for delete
to authenticated
using (auth.uid() = subscriber_id);
