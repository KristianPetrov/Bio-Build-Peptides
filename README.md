# Bio Build Peptides

Storefront for research-use-only peptides — Next.js 16.3 (App Router), React 19, Tailwind CSS v4,
Drizzle ORM on Neon Postgres, deployed on Vercel. Structure and commerce model follow the owner's
Affordable Peptides, East Coast Wellness and Pure Energy Peptides sites.

## Features
- Catalog (33 products, Affordable Peptides strengths and 1/5/10-vial tier prices) with research-area
  filters, search, sorting, product pages with live-labelled vial imagery and 3D molecular models.
- Cart drawer (localStorage) with loose-vial volume pricing; server re-prices every cart.
- Checkout with research-use confirmation, referral codes, and manual payment after ordering
  (Zelle, Venmo, Cash App, hosted pay link). Methods appear only when their destination is configured.
- Orders reserve tracked inventory; cancelling restores it. Order pages are protected by a secret
  link, account ownership, or an email + order-ID lookup on `/track`.
- Customer accounts with order history. Admin at `/admin`: orders (paid → shipped with tracking →
  cancel), products & stock, referral partners/codes, contact messages.
- 21+ age gate, RUO notices, sitemap, robots, Open Graph image, JSON-LD.

## Setup
```bash
pnpm install
vercel env pull .env.local --environment=preview   # or copy .env.example
pnpm db:push      # create tables
pnpm db:seed      # seed catalog (idempotent; never overwrites admin edits)
pnpm dev
```
Become admin: add your email to `ADMIN_EMAILS`, then register at `/account/register`.

## Scripts
`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm db:push` · `pnpm db:seed`
