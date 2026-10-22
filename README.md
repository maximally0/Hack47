# Hack47

Delhi's first hacker house. A 30-day residency for 16 builders who ship fast, sleep less, and build what matters.

**Sept 15 – Oct 15 | Delhi** — expanding to Mumbai, Bangalore & Chandigarh.

## What is this

A Windows XP-themed website for Hack47, a hacker house residency in Delhi. The entire site is designed as an interactive desktop environment with draggable windows, floating animations, dynamic clouds, and a built-in "Sell Your Soul" application form.

The site is a full OS simulation:

- **Desktop:** draggable, floating windows — house info, protocols, photos, system specs, residents, archdemons (the team)
- **NETWORK_NEIGHBORHOOD.EXE** — social links app: X, Instagram, LinkedIn in one window
- **NEXT_NODES.EXE** — city map: Delhi (live) → Mumbai, Bangalore, Chandigarh, and more across India
- **NEWS_SIGNAL.EXE** — press + live feed: Mint feature + latest X/LinkedIn posts (fed by `public/feed/latest.json`)
- **POWER_SUPPLY.INI** — sponsors: Red Bull & OpenAI
- **OFFGRID.EXE** — the virtual hackathon; winner gets a golden ticket to the next cohort
- **HELPDESK.EXE** — contact: hello@hack47.org · +91 90412 60790
- **Mobile:** full rebuilt experience — sticky header, golden ticket promo, city map, sponsors, news, team, contact, and a Windows-style bottom dock (Apply / Nodes / News / Call)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP (GreenSock) + Draggable plugin
- **Fonts:** Anton, IBM Plex Mono
- **Deployment:** Netlify / Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Windows XP desktop environment with draggable, floating windows
- 2x2 grid layout that adapts to any screen size (no overlapping)
- Dynamic cloud layer with GSAP-animated drift and bob
- In-page typeform-style application ("Sell Your Soul") with field validation
- Photo gallery with prev/next navigation
- Social links app, city roadmap, live news feed, sponsors, golden-ticket hackathon promo, contact helpdesk
- Mobile: stacked-card experience with a sticky top bar and bottom dock
- Full SEO: Open Graph, Twitter Cards, sitemap, robots.txt, web manifest

## News feed (auto-update)

The `NEWS_SIGNAL` window reads `public/feed/latest.json` — the Mint press card plus the latest posts from @hack47org and /company/hack47.

Refresh it manually (requires the shared logged-in browser on CDP port 9333 — see `launch_linkedin.js` in the workspace):

```bash
node scripts/refresh_hack47_feed.cjs
```

The script pulls both profiles through the browser, never overwrites good data with a failed pull, and rewrites `public/feed/latest.json`. Commit and push after a refresh to deploy the new feed. To run it on a schedule, point a cron job at:

```bash
node scripts/refresh_hack47_feed.cjs --json   # prints {changed, x, linkedin}
```

## Structure

- `app/page.tsx` — the whole OS (desktop + mobile views)
- `app/layout.tsx` — metadata, favicons, fonts
- `components/` — win-window, desktop-icon, taskbar
- `public/feed/latest.json` — news feed data
- `public/sponsors/` — sponsor logos
- `scripts/refresh_hack47_feed.cjs` — feed refresh script
