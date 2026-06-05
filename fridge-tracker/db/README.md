# Fridge Tracker DB

This folder contains the Supabase database setup for Fridge Tracker.

## Setup

1. In Supabase, open the SQL editor.
2. Run the SQL from `schema.sql`.
3. Open `config.js`.
4. Replace `YOUR_SUPABASE_PROJECT_URL` with your Supabase project URL.
5. Replace `YOUR_SUPABASE_ANON_KEY` with your public anon key.

The app uses the browser Supabase client from the CDN in `index.html`, then `fridgeDb.js` reads and writes rows in these tables:

- `ingredients`
- `app_settings`

Do not put a Supabase service-role key in `config.js`. The anon key is okay for browser code.
