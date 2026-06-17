# AvailifyAi

A fast, mobile-first **username availability checker**. Type a handle once and
see whether it's free across major social apps, creator platforms, developer
sites, and matching domains.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**. No database,
deploys to Vercel with zero configuration.

## Product tiers

**Free ($0/mo)**

- 3 searches total.
- Basic availability check only.
- .com domain result.

**Pro ($10/mo)**

- Unlimited searches.
- AI Name Assistant for brainstorming and picking stronger names.
- Bulk Domain Checker for up to 20 names at once.
- Instant TLD checks for .com, .ai, .io, .net, and .co.
- Watchlist and alerts for saved favorite names.

**Business ($29/mo)**

- Everything in Pro.
- More advanced brand reports.
- Higher limits.
- Team-friendly use.
- Priority support.

---

## Payments (Stripe Payment Links)

Paid tiers use **Stripe Payment Links** — there is no backend, no database, and
**no secret API key** anywhere in this app. You create the links in your Stripe
dashboard and paste the public URLs into the environment.

> ⚠️ Never put a secret Stripe key (`sk_…`) in this repo, in `.env`, or in chat.
> Only the public `https://buy.stripe.com/…` Payment Links belong here.

**One-time setup:**

1. In the [Stripe Dashboard](https://dashboard.stripe.com/), create two
   **Products** with recurring monthly prices: **Pro** ($10/mo) and
   **Business** ($29/mo).
2. For each product, create a **Payment Link** (Product → **Create payment
   link**). Copy the resulting `https://buy.stripe.com/…` URL.
3. *(Optional but recommended)* In each Payment Link's settings, set the
   **confirmation page** to redirect to your deployed success page:
   - Pro → `https://YOUR_DOMAIN/success?plan=pro`
   - Business → `https://YOUR_DOMAIN/success?plan=business`
4. Add the two links to your environment:

   ```bash
   # .env.local for local dev — see .env.example
   NEXT_PUBLIC_STRIPE_PRO_PAYMENT_LINK=https://buy.stripe.com/xxxxxxxxPro
   NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK=https://buy.stripe.com/xxxxxxxxBiz
   ```

   On Vercel, add the same two variables under **Settings → Environment
   Variables**, then redeploy.

Until the links are set, the Pro/Business buttons show a friendly "not
configured yet" notice instead of breaking. The plan config lives in
[`lib/billing.ts`](lib/billing.ts); the post-checkout page is
[`app/success/page.tsx`](app/success/page.tsx).

> **Note on what this does and doesn't do:** Payment Links collect payment and
> email the customer a receipt and a self-serve billing portal. They do **not**
> automatically unlock Pro features per logged-in user — this app has no
> accounts or database, and the Free/Pro toggle on the page is a UI preview.
> Gating real features behind a verified payment would require adding auth, a
> backend, Stripe webhooks, and a database.

---

## How it works

The page calls a single serverless route, `GET /api/check?username=X`, which
fans out to one adapter per platform. Each adapter runs concurrently with a
hard **5-second timeout** and a realistic browser `User-Agent`. The API returns:

```json
[
  {
    "platform": "GitHub",
    "status": "available",
    "checkedVia": "GitHub API",
    "profileUrl": "https://github.com/example"
  }
]
```

`status` is one of:

| Status        | UI color | Meaning                                                      |
| ------------- | -------- | ------------------------------------------------------------ |
| `available`   | 🟢 green  | The handle is free.                                          |
| `taken`       | 🔴 red    | The handle is in use.                                        |
| `unknown`     | ⚪ grey   | Couldn't determine — use the **Open ↗** link to verify by hand. |

### Tiers

**Tier A — real checks** (authoritative):

- **GitHub** — `GET api.github.com/users/{u}` → `404` available, `200` taken.
- **Reddit** — `GET reddit.com/user/{u}/about.json` → missing/error body
  available, valid account taken.
- **YouTube** — `GET youtube.com/@{u}` → `404` available, channel page taken.
  Guards against soft-`200` error pages.
- **Domains** — DNS checks for `.com`, `.ai`, `.io`, `.net`, and `.co`.

**Tier B — best-effort/manual checks** (TikTok, X, Instagram, Threads, Twitch,
Facebook, Snapchat, Pinterest, LinkedIn, Steam, Spotify, SoundCloud, Roblox,
Telegram, Medium, Substack, GitLab, and Discord): these platforms often block
automated requests or do not expose reliable public username APIs. The checker
**never guesses** — if a request is blocked, rate-limited, ambiguous, or needs an
in-app lookup, it returns `unknown` so you can verify manually via the profile
link.

- **Twitch** is a *real* check when `TWITCH_CLIENT_ID` and
  `TWITCH_CLIENT_SECRET` are set (via the Helix API); otherwise it returns
  `unknown`.

### Validation

Each platform has its own handle rules (length + allowed characters). If a
username can't be valid on a platform, the network call is skipped and the row
reports `unknown` with reason `invalid format`.

### Caching

Optional in-memory TTL cache (5 min) avoids re-hitting upstreams for repeated
lookups on a warm instance. `unknown` results are never cached. There is no
database and nothing is persisted.

---

## Local development

Requires **Node.js 18.17+**.

```bash
# 1. Install dependencies
npm install

# 2. (optional) enable the real Twitch check
cp .env.example .env.local
# then fill in TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

---

## Deploy to Vercel

This app is zero-config on Vercel.

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and **import** the repo.
3. Framework preset auto-detects **Next.js** — accept the defaults.
4. *(Optional)* Add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` under
   **Settings → Environment Variables** to enable the real Twitch check.
5. Click **Deploy**.

Or with the CLI:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

The API routes run as serverless functions automatically — no extra setup.

---

## Notes & limitations

- Tier B results are intentionally conservative. A `taken`/`available` verdict
  there means the platform gave an unambiguous signal; otherwise you'll see
  `unknown`. This avoids false positives from login walls and JS-only pages.
- Availability is a best-effort snapshot, not a reservation. Always confirm on
  the platform itself before relying on a handle.
- All network failures degrade gracefully to `unknown` — the app never crashes
  on a bad upstream.

## Project structure

```
app/
  api/check/route.ts     # GET /api/check?username=X
  components/ResultRow.tsx
  layout.tsx
  page.tsx               # the UI
lib/
  platforms.ts           # one adapter function per platform
  check.ts               # concurrent orchestration + per-adapter safety
  validation.ts          # per-platform handle rules
  http.ts                # fetch with timeout + User-Agent
  cache.ts               # optional in-memory TTL cache
  types.ts
```
