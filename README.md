# Debt Reset Dashboard

A coaching portal for the **90-Day Debt Reset** program. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

---

## Two ways to run this app

### 🎬 Demo Mode (no setup, fake data)
The app works out of the box without any backend. Data is stored in the browser, demo logins are pre-loaded.
Use this to **show clients what the program looks like** before going live.

**Demo logins:**
- Coach: `coach@example.com` / `coach123`
- Client: `maria@example.com` / `maria123`
- Client: `james@example.com` / `james123`

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### 🚀 Production Mode (real database, real users)
Once you set up Supabase (free tier), the app stores real data and uses real authentication.
This is what you'll deploy for actual coaching clients.

See **"Setting up Supabase"** below.

---

## Setting up Supabase (one-time, ~15 minutes)

These instructions are written for someone with no programming experience.

### Step 1: Create a Supabase account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up (it's free)
3. Click **"New project"**
4. Name it `debt-reset-dashboard`, pick a strong database password (save it somewhere safe), and choose the region closest to you
5. Wait ~2 minutes for the project to be created

### Step 2: Run the database setup script
1. In your new Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"+ New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this repository
4. Copy **all** of its contents and paste into the Supabase SQL editor
5. Click the green **"Run"** button (bottom right)
6. You should see "Success. No rows returned" — the tables are now created

### Step 3: Get your API keys
1. In Supabase, click **"Project Settings"** (gear icon, bottom of sidebar) → **"API"**
2. You'll see two values to copy:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

### Step 4: Add them to your project
1. In your project folder, copy `.env.local.example` to a new file called `.env.local`
2. Open `.env.local` and paste your two values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Save the file
4. Restart the dev server (`Ctrl+C`, then `npm run dev`)

### Step 5: Create your first coach account
1. Open the app and go to **/register**
2. Sign up with your real email + a password
3. By default new accounts are created as **clients**. To make yourself a **coach**:
   - In Supabase, go to **"Table Editor"** → **`users`** table
   - Find your row, click on the **`role`** column, change it from `client` to `coach`
   - Click **"Save"**
4. Sign out and sign back in — you're now a coach!

### Step 6: Email confirmation (optional but recommended)
By default, Supabase sends a confirmation email to new sign-ups. To skip this for testing:
1. Supabase → **"Authentication"** → **"Providers"** → **"Email"**
2. Toggle off **"Confirm email"**
3. Save

For a real production app, leave email confirmation **on**.

---

## Deploying to Vercel

1. Push this code to GitHub (already done if you're using a forked PR branch)
2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** and import this repository
4. **Important:** Add the same two environment variables you put in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **"Deploy"**
6. After ~2 minutes you'll get a public URL (e.g., `your-app.vercel.app`)

That's it — you have a real, working app.

---

## What's included (Version 1)

**Client features:**
- Dashboard, debt snapshot, snowball/avalanche selector
- Cash-flow audit, spending leak audit
- Payment calendar, weekly check-in form
- Emergency fund tracker, 90-day program timeline
- Progress report

**Coach/admin features:**
- Coach dashboard (all clients), client management
- Coach notes, automated coach alerts
- Check-in review with response capability
- 90-day report per client

**Built in:**
- Real authentication (Supabase Auth)
- Real database (PostgreSQL via Supabase) with row-level security
- Mobile-responsive design
- Legal disclaimer everywhere required
- Auto-generated risk-flag alerts

---

## Tech stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **State:** Zustand (client-side cache, synced with Supabase)
- **Charts:** Recharts
- **Icons:** Lucide

---

## Disclaimer

This app and the 90-Day Debt Reset program provide **educational financial coaching only**. They are **not** legal, tax, investment, bankruptcy, credit repair, or debt settlement advice. Results vary based on income, expenses, debt levels, behavior, and client participation.
