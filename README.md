# Finora

**Spend smarter. Live better.**

Finora is a personal expense tracking and budgeting web application. It helps people record everyday expenses, manage monthly budgets, and understand spending patterns through clear, explainable summaries.

> Finora is a budgeting tool, not financial, tax, legal, or investment advice. Confirm brand, trademark, and domain availability before commercial use.

## Problem and objectives

It can be difficult to keep track of small purchases and know whether a monthly plan is working. Finora brings transactions, budgets, and straightforward spending analytics together in one responsive app.

The project is built as an understandable learning example: UI components are separated from database access, server actions validate input, and reusable calculations can be tested independently.

## Features

- Email/password sign-up, sign-in, email confirmation callback, password reset, and sign-out with Supabase Auth.
- User-owned transactions with search, category filter, sorting, add/edit/delete, and CSV export.
- Monthly overall and category budgets with in-app 80% and 100% warnings.
- Dashboard and responsive Recharts visualizations for categories, daily spending, monthly trends, and budgets.
- Four deterministic spending insights with their rules and uncertainty explained.
- Rule-based category suggestions that users can change; these are not machine learning.
- Explicit opt-in sample transactions, visibly labelled and removable without affecting personal transactions.
- PostgreSQL row-level security (RLS) policies for profile, transaction, and budget data.
- Responsive desktop sidebar and mobile navigation.
- Unit tests for exact currency calculations, date boundaries, validations, insights, and CSV escaping.

## Technology

- Next.js App Router and React
- TypeScript with strict checking
- Tailwind CSS
- Supabase Auth and PostgreSQL
- Recharts and Lucide icons
- Zod, Vitest, and Playwright
- Vercel-compatible deployment

## Architecture

- `app/` contains the landing page, auth flows, route layouts, pages, and server actions.
- `components/` contains reusable UI and client interactions.
- `lib/analytics/` contains pure currency and spending calculations.
- `lib/validation/` contains schemas shared by client-facing forms and server actions.
- `lib/supabase/` contains browser/server Supabase clients. The app only uses the public anon key; access to user data is enforced by RLS.
- `supabase/migrations/` contains reproducible PostgreSQL schema and security policies.
- `tests/` contains unit tests and browser smoke tests.

### Database schema

| Table | Purpose | Ownership and safeguards |
|---|---|---|
| `profiles` | Display name and timestamps for an auth user | `id` references `auth.users`; RLS permits the owner to read/update |
| `transactions` | Expense description, `numeric(12,2)` amount, category, date, payment method, notes, demo marker, timestamps | `user_id` references `auth.users`; amount must be positive; RLS limits all operations to owner |
| `budgets` | Monthly overall or category limit | `user_id` references `auth.users`; unique owner/month/category; RLS limits all operations to owner |

The migration creates useful owner/date indexes, timestamp triggers, a profile-on-sign-up trigger, and RLS policies. Run it in a fresh Supabase project's SQL Editor. It is idempotent for this initial schema, but always review a migration against an existing production database before applying it.

## Requirements

- Node.js 20.9 or newer (the project uses Next.js 16 and React 19).
- A Supabase project for accounts and persistent database access.
- npm.

## Local setup

1. Install packages:

   ```bash
   npm install
   ```

2. Create a Supabase project. In **Project Settings → API**, copy the project URL and the **anon/public** key. Never use a service-role key in this app.

3. Copy `.env.example` to `.env.local`, then set:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   `.env.local` is ignored by Git. Do not commit credentials.

4. In Supabase **SQL Editor**, run [`supabase/migrations/202610150001_initial_schema.sql`](./supabase/migrations/202610150001_initial_schema.sql).

5. In Supabase **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and add these Redirect URLs:

   ```text
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/callback?next=/dashboard
   http://localhost:3000/auth/callback?next=/auth/reset
   ```

   For production, also add the matching HTTPS callback URLs for your verified Vercel domain. Set `NEXT_PUBLIC_SITE_URL` in the Vercel project to that canonical HTTPS origin. Email verification must be enabled in the Supabase email provider if you want confirmation-before-login. Configure the Supabase email templates and SMTP/provider as appropriate for your project.

6. Start the development server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

### Demo data

The unauthenticated dashboard preview on the landing page is static, clearly labelled illustrative sample information. It never reads or writes a user's database.

After you create and verify an account, **Settings → Add sample transactions** inserts five labelled demo records for that signed-in user, only after an explicit click. The action refuses to duplicate demo rows. **Remove demo data** deletes only records marked `is_demo`; personal transactions remain separate. No real financial records are included in this repository.

Without Supabase credentials, the landing and authentication screens remain viewable, and protected app routes show a setup message instead of fabricated account totals.

## Authentication and data safety

- Auth state is verified on the server. Server actions validate their payloads and derive the owner ID from the verified Supabase session, never from a browser-supplied user ID.
- The database RLS policies provide the final ownership boundary for all user tables.
- Only the Supabase public anon key is used by this app; do not add a service-role key, database password, or private credential to `NEXT_PUBLIC_*`, source code, logs, or Git.
- Row-level security tests that require a live database need a separately configured Supabase test project and should use disposable test accounts. This repository's automated unit tests do not claim to verify a live Supabase project.
- Password recovery uses Supabase email links. The callback exchanges the one-time authorization code for a session and the reset page requires that session before allowing a password update.

## Beginner-friendly code notes

- **Exact money:** database amounts use PostgreSQL `numeric(12,2)`. In JavaScript, `lib/analytics/money.ts` converts decimal values into integer cents before adding or comparing them, so calculations do not depend on imprecise binary floating-point addition.
- **Validation:** `lib/validation/finance.ts` describes acceptable amounts, dates, category names, and text lengths. Server actions call these Zod schemas again; browser form attributes are only a convenience, not the security check.
- **RLS:** PostgreSQL checks `auth.uid() = user_id` for a transaction or budget operation. Even if a client changes an ID in a request, the database policy does not grant another user's rows.
- **Insights:** the analytics module uses documented deterministic comparisons and a simple daily pace estimate. It is not a trained prediction or fraud model.
- **Category suggestions:** keyword rules suggest a category from the description. The user can select another category before saving.

## Checks and tests

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For browser smoke tests (public landing, navigation, and unconfigured-auth states):

```bash
npx playwright install chromium
npx playwright test
```

The browser test suite does not claim to exercise a live Supabase sign-up or transaction flow without configured credentials. Never report a check as successful unless it actually ran and passed.

## GitHub publishing

Inspect current state before initializing, staging, or adding a remote:

```bash
git status --short --branch
git remote -v
```

If this folder is not already a Git repository, initialize and create the first commit:

```bash
git init
git add .
git status --short
git commit -m "Build Finora personal finance app"
```

Create a repository named `finora` on GitHub, then add it **only if** `git remote -v` shows no existing `origin`:

```bash
git remote add origin https://github.com/YOUR_ACCOUNT/finora.git
git branch -M main
git push -u origin main
```

If an origin or prior history already exists, inspect it and use the appropriate safe workflow rather than replacing a remote or rewriting history. GitHub CLI and a GitHub account are not required to develop locally.

## Vercel deployment

1. Push the project to GitHub using the safe steps above.
2. Import that repository in Vercel and select the Next.js framework preset. Use `finora` as the project name if available.
3. Add the three variables from `.env.example` in Vercel's project environment settings for the intended environments. Use the Supabase project URL and anon/public key; set `NEXT_PUBLIC_SITE_URL` to the production HTTPS origin.
4. Add the production callback URLs to Supabase Authentication URL Configuration and apply the schema migration to the intended Supabase project.
5. Deploy and verify the live landing, email verification, password reset, protected route redirects, and owner-scoped reads/writes with test accounts.

Do not publish a URL or claim a successful deployment until it has been deployed and checked. Vercel build logs may contain configuration errors; do not paste secrets when seeking help.

## Limitations and future improvements

- Spending insights compare the selected month with the immediately preceding month; a richer history model could use more months and seasonality.
- The daily-pace month-end estimate is intentionally simple and may differ from actual spending.
- Transaction queries are fetched in bounded server-side pages for personal accounts; very large datasets may benefit from database-side reporting and additional UX pagination.
- Email deliverability depends on the project's configured Supabase email provider.
- Push, SMS, and email budget notifications are not implemented.
- Finora does not connect to banks, payment networks, or investment services.

## LinkedIn post draft

> I’ve been building **Finora — Spend smarter. Live better.**, a personal finance app for tracking everyday expenses and making monthly budgets easier to understand.
>
> The project brings together a responsive Next.js interface, Supabase authentication and row-level database security, transaction management, budget tracking, CSV export, and explainable spending analytics. Category suggestions and insights use documented rules rather than a trained AI model.
>
> Building Finora has been a hands-on way to learn full-stack TypeScript, PostgreSQL schema design and RLS, secure server-side validation, and testing finance calculations without floating-point surprises.
>
> GitHub: [add the real repository URL after publishing]  
> Live app: [add the verified deployment URL after deployment]
>
> #Nextjs #TypeScript #Supabase #PersonalFinance #WebDevelopment #LearningInPublic
>
> Update this draft to reflect only the features and test results you have verified before posting.
