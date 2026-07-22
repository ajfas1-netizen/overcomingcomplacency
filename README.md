# From Drift to Drive — Companion App

The interactive companion to **_From Drift to Drive: A High Achiever's Guide to Breaking the Chains of Complacency_** by **Chris Robinson** (Executive Vice President, Maxwell Leadership; foreword by John C. Maxwell).

This app immerses readers in the book's core ideas and gives them tools to *work* the material, not just read it.

## What's inside

The app is a click-in, screen-based experience (hash-routed SPA — back button and deep links work; on mobile it gets a native-style bottom tab bar):

| Screen | What it does |
|---|---|
| **Home** | Cover-matched hero, the three lanes (diagnose → framework → challenge), cost-of-complacency stats, rotating book quotes, and a "welcome back, driver" strip once you have data |
| **Drift Check** | A 12-question self-assessment inspired by the book's awareness questions, scored into three zones (Driver's Seat / Cruise Control / Drifting) with personalized next moves — plus a pointer to Chris's official Complacency Assessment Profile at [drift2drivequiz.com](https://drift2drivequiz.com) |
| **7 Steps** | An interactive mile-marker journey through Clarity, Gathering, Filtering, Guidance, Relationships, Action, and Evaluate — each step with key concepts, traps, quotes, a **working tool**, and a "mark complete" **lap system** (finish all 7 → Lap 2 begins, just like the book's loop): |
| | 1. Clarity → the **I-Exam Chart** builder |
| | 2. Gathering → the **BVACC Tracker** (gather 10, then stop) |
| | 3. Filtering → **Today's Index Card** (the five daily questions) |
| | 4. Guidance → the **Mentor Vetting Checklist** |
| | 5. Relationships → the **Right-Rooms Audit** |
| | 6. Action → the **Divide-to-Multiply Calculator** |
| | 7. Evaluate → the **Four-Question Debrief** journal |
| **Challenge** | The 30-Day Drive Challenge as a **highway**: 30 mile markers on one scrollable road (phases color-coded, your car marks the current day), a single focus card with a "complete & drive on" flow, progress, and real day-streak tracking |
| **My Garage** | The cockpit: drift score with trend vs. last check, framework lap progress, challenge streak, your vision, next easiest step, today's index card status, and evaluation-loop counts — all in one glance |
| **Connect** | Meet-the-author section, links to Chris's speaker site / the official assessment / Maxwell Leadership / the book, plus an email-capture form (demo mode) |

All user entries (assessment results, charts, cards, challenge progress) are stored **privately in the reader's browser** via `localStorage` — no backend, no accounts, no data collection.

## Running it

It's a fully static site — no build step, no dependencies.

```bash
# any static server works; e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

Or simply open `index.html` in a browser.

## Deploying (GitHub Pages)

1. In the repo: **Settings → Pages → Source → Deploy from a branch**
2. Pick the branch (e.g. `main` after merging) and `/ (root)`
3. The app will be live at `https://<user>.github.io/overcomingcomplacency/`

## Customizing

- **Content** — all book-derived copy (quiz questions, step content, challenge days, quotes) lives in `js/data.js`
- **Brand** — colors and fonts are CSS variables at the top of `css/styles.css` (currently a Maxwell-inspired deep navy + road-line gold). Swap them to match the final cover art.
- **Email signup** — the form in the Connect section is a demo. Replace the handler at the bottom of `js/app.js` with your email platform's embed (Mailchimp, ConvertKit, Kit, etc.).
- **Links** — the app links to `chrisrobinsonspeaker.com`, Chris's Maxwell Leadership speaker profile, and `drift2drivequiz.com`; add book retail links in the Connect section of `index.html` when available.

## File structure

```
index.html        page structure
css/styles.css    all styling (brand variables at top)
js/data.js        book content: quiz, 7 steps, 30-day challenge, quotes
js/app.js         interactivity: quiz flow, step tools, challenge tracker
```
