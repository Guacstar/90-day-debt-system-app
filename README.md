# Debt Reset Dashboard

A Next.js MVP for **The 90-Day Debt Reset**, a debt payoff coaching portal for clients and coach/admin users.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the role switcher to preview client and coach/admin experiences.

## Included MVP scope

- Mock authentication role switcher for client and coach/admin demos
- Client onboarding with educational coaching disclaimer and referral warning logic
- Client dashboard with debt, check-in, payment, emergency fund, and 90-day progress cards
- Debt snapshot CRUD-style UI and snowball/avalanche payoff selector
- Cash-flow audit, spending leak audit, payment calendar, weekly check-in, emergency fund tracker, timeline, and report screens
- Coach/admin dashboard with client table, alerts, check-ins, notes, and reports
- Supabase/PostgreSQL schema, seed users/clients, and starter RLS policies in `supabase/schema.sql`

## Disclaimer

This app and coaching program provide educational financial coaching only. This is not legal, tax, investment, bankruptcy, credit repair, or debt settlement advice. Results vary based on income, expenses, debt levels, behavior, and client participation.
