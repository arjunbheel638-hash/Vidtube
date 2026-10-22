# VIDTUBE – Video Sharing Platform

VIDTUBE is a video-sharing platform project designed for creators and viewers.

## Features

- Home video feed
- Shorts-style vertical video section
- Search videos
- Video upload interface
- Video watch page and player
- Likes and comments
- Subscribe and channels
- Login and signup (backend integration required)
- User profiles
- Creator Studio (planned integration)

## Project Structure

```text
vidtube/
├── api/
│   └── search.js
├── app.js
├── index.html
├── style.css
├── watch.html
├── supabase.sql
└── README.md
```

## Technologies

- HTML5
- CSS3
- JavaScript
- Node.js / Vercel serverless functions
- Supabase database and storage (integration required)

## Run Locally

1. Download or clone this repository.
2. Open the project folder.
3. Run a local development server.
4. Open `index.html` in your browser.

For API routes, use the Vercel development environment.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run the SQL from `supabase.sql`.
4. Configure the required database tables.
5. Configure Supabase Storage and access policies.
6. Add the required environment variables to Vercel.

Required environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Security:** Never put the Supabase service role key in frontend HTML or JavaScript. Store it only as a server-side environment variable.

## Deployment

This project is intended for deployment on Vercel.

1. Connect the GitHub repository to Vercel.
2. Configure the environment variables.
3. Deploy the project.
4. Test the frontend and API routes.

## Important

The frontend files provide the website interface. Real user accounts, video uploads, video playback, likes, comments, subscriptions, and Creator Studio require working backend APIs, database tables, authentication, and storage policies.

Not every feature is active until those integrations are completed and tested.

## Project

**Name:** VIDTUBE  
**Type:** Video Sharing Platform  
**Repository:** GitHub  
