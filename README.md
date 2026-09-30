# Company Studio Advertisement Page

A standalone **advertisement landing page** for **Ingenuity Studio**, pitching its flagship
product **Forecourt** — the AI video pipeline for used-car dealers — to independent US
dealerships. This is marketing material, *not* the product itself and not the official
product site.

## View it

**Live sites (GitHub Pages):**

| Site | URL |
|---|---|
| Shipped design (editorial classifieds) | https://ingenuity-studios.github.io/Company-Studio-Advertisement-page/ |
| Alternate dark-cinematic design | https://ingenuity-studios.github.io/Company-Studio-Advertisement-page/preview/classified/ |

(Both served from this repo — GitHub Pages on the free plan requires the repo to be
public; the site content is public anyway once it's served.)

Pure static files — no build step.

```bash
# either:
open index.html                       # just open it
python3 -m http.server 8000           # or serve, then http://localhost:8000
```

- `index.html` — **shipped design (editorial classifieds)**: the whole page set as a
  dealership newspaper spread — newsprint paper, ink black and classified red, a
  self-rewriting specimen ad as the hero, the 20-minute pipeline story, feature
  grid, competitive positioning, and an interactive honest ROI calculator.
- `preview/classified/index.html` — **alternate dark-cinematic design** (asphalt-black
  surfaces, amber accent, a day-in-the-life pipeline timeline) built during the same
  sprint and kept in the tree as a visual reference. Its files are self-contained
  under `preview/`. Not linked from the live page.

## What we claim (and where it comes from)

Every statistic is real, public market evidence — never a fabricated result:

| Claim | Source |
|---|---|
| Listings with video: +41% lead forms, up to 3.2× VDP conversion | Cox Automotive |
| ~95% of dealership sales reps still don't use video tools | Cox / industry research |
| #CarTok: 44 billion+ views | TikTok hashtag data |
| Status quo costs: creators $10–16/hr, agencies $500–$3,000/mo, 60–90 min per video | prevailing freelance/agency rates |

House honesty rules: no invented testimonials, customers, logos, pricing, or product
screenshots. The product is described as onboarding pilot dealers, not shipping
everywhere. Illustrative pipeline visuals are labeled as such.

## Photography

Real stock photographs vendored under `assets/img/`, Unsplash/Pexels licensed,
credited per-photo in `assets/CREDITS.md`.

## How this was made

A 5-agent Claude Code sprint (2026-09-28): two designers built competing full pages in
parallel, a commander picked and staged the strongest, and two QA agents brute-tested
design, copy, and honesty — their fixes land as follow-up commits on this repo.

— Ingenuity Studio
