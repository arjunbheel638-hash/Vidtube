
-- =========================================
-- VIDTUBE DATABASE SETUP
-- Supabase: Videos, Likes, Comments, Profiles
-- =========================================

create extension if not exists pgcrypto;

-- 1. USER PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. VIDEOS
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  description text default '',
  category text not null default 'Other',
  video_url text not null,
  thumbnail_url text,
  views bigint not null default 0 check (views >= 0),
  created_at timestamptz not null default now()
);

-- 3. LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

-- 4. COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- 5. SEARCH / FEED INDEXES
create index if not exists videos_created_at_idx
  on public.videos (created_at desc);

create index if not exists videos_category_idx
  on public.videos (category);

create index if not exists videos_user_id_idx
  on public.videos (user_id);

create index if not exists likes_video_id_idx
  on public.likes (video_id);

create index if not exists comments_video_created_idx
  on public.comments (video_id, created_at desc);

-- 6. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- 7. REMOVE OLD POLICIES (allows safe re-running)
drop policy if exists "Profiles are publicly readable" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;

drop policy if exists "Videos are publicly readable" on public.videos;
drop policy if exists "Authenticated users upload videos" on public.videos;
drop policy if exists "Owners update videos" on public.videos;
drop policy if exists "Owners delete videos" on public.videos;

drop policy if exists "Likes are publicly readable" on public.likes;
drop policy if exists "Users add own likes" on public.likes;
drop policy if exists "Users remove own likes" on public.likes;

drop policy if exists "Comments are publicly readable" on public.comments;
drop policy if exists "Authenticated users add comments" on public.comments;
drop policy if exists "Owners delete comments" on public.comments;

-- 8. PROFILE POLICIES
create policy "Profiles are publicly readable"
on public.profiles for select
using (true);

create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 9. VIDEO POLICIES
create policy "Videos are publicly readable"
on public.videos for select
using (true);

create policy "Authenticated users upload videos"
on public.videos for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners update videos"
on public.videos for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Owners delete videos"
on public.videos for delete
to authenticated
using (auth.uid() = user_id);

-- 10. LIKE POLICIES
create policy "Likes are publicly readable"
on public.likes for select
using (true);

create policy "Users add own likes"
on public.likes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users remove own likes"
on public.likes for delete
to authenticated
using (auth.uid() = user_id);

-- 11. COMMENT POLICIES
create policy "Comments are publicly readable"
on public.comments for select
using (true);

create policy "Authenticated users add comments"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners delete comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

-- 12. VIDEO STORAGE BUCKET
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'videos',
  'videos',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = true,
    file_size_limit = 52428800,
    allowed_mime_types = array[
      'video/mp4', 'video/webm', 'video/quicktime'
    ];

-- 13. STORAGE POLICIES
drop policy if exists "Public can view video files" on storage.objects;
drop policy if exists "Users upload to own folder" on storage.objects;
drop policy if exists "Users update own video files" on storage.objects;
drop policy if exists "Users delete own video files" on storage.objects;

create policy "Public can view video files"
on storage.objects for select
using (bucket_id = 'videos');

create policy "Users upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own video files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own video files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

