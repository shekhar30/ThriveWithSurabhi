# AGENTS.md

## Project overview

Nutrition coaching website for **Surabhi** ("Thrive with Surabhi"). Target audience: **busy women who want to get fit and lose weight**. The goal is client conversion (visitor -> books a consultation). **Mobile-first** design priority.

## Architecture

- **Single-page static site**: Everything is in `index.html` (HTML + inline `<style>` + inline `<script>`). No framework, no components, no build step.
- **Backend**: `server.js` is a Node/Express API for booking form submissions + admin email notifications via Nodemailer.
- **Styling**: Tailwind CSS loaded via CDN (`cdn.tailwindcss.com`) with inline `tailwind.config`. Custom CSS uses glassmorphism (`glass-card`), scroll-reveal animations (`reveal`, `reveal-delay-{1,2,3}`), and gradient effects.
- **No database**: Bookings are stored in-memory (`bookings[]` array). The commented-out Mongoose schema at the bottom of `server.js` is a placeholder for future DB integration.

## Key files

| File | What it is |
|------|-----------|
| `index.html` | Entire frontend: markup, styles, JS (form submission, scroll animations, mobile nav) |
| `server.js` | Express API + Nodemailer email templates (customer confirmation, admin notification) |
| `.env` | `EMAIL_USER`, `EMAIL_PASSWORD`, `ADMIN_EMAIL`, `PORT` -- required for email sending |
| `ISSUES.md` | Tracked website critique items with priority and status -- check before making UX changes |
| `.clinerules` | Legacy project context file (audience, purpose, design priorities) |

## Commands

```bash
npm install          # install deps
npm run dev          # start with nodemon (auto-reload)
npm start            # start server (node server.js), default port 3000
```

No test suite, no linter, no build step, no CI pipeline.

## Gotchas

- **Package name mismatch**: `package.json` says `nutrilife-backend` (legacy name). The actual brand is "Thrive with Surabhi". Email templates in `server.js` still reference "NutriLife" in places -- this is a known issue (#9 in `ISSUES.md`).
- **No build step**: Tailwind is loaded via CDN, not compiled. Editing classes takes effect immediately but there's no purge/minification.
- **All content is hardcoded**: There are no data files, no CMS, no JSON for services/testimonials/etc. Edit `index.html` directly.
- **Form JS has dead code**: `simulateBookingSubmission` has unreachable code after `return await response.json()` -- the demo simulation path never executes (issue #15).
- **`.env` has real credentials**: Never commit changes to `.env`. It contains Gmail app passwords.
- **Images**: `surabhi.png` and `images/` directory contain real photos used on the site.

## Conventions

- Commit messages reference `ISSUES.md` item numbers when applicable (e.g., `fixes #3`).
- Push directly to `main` -- no PR workflow.
- Update `ISSUES.md` status when resolving tracked issues (🔴 -> 🟡 -> 🟢).
