# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A personal pet project: a map of coffee shops we've visited. It's a **static
single-page app** — no backend. Coffee shop data lives in a static JSON file
that the app fetches in the browser and renders as pins on a map.

## Stack

- **Vite** + **React 19** + **TypeScript** (the usual client SPA setup)
- **Leaflet** via **react-leaflet** for the map, with **OpenStreetMap** tiles
  (free, no API key, no billing). MapLibre is the upgrade path if we ever want
  prettier vector maps.
- **GitHub Pages** for hosting, deployed by GitHub Actions, on a custom domain.

Node is managed with **nvm** (LTS). Run `nvm use` if a version drifts.

## Data model

Coffee shops live in `public/data/coffee.json` and are fetched at runtime from
`/data/coffee.json`. Files in `public/` are copied verbatim into the build and
served at the site root — that's why the data goes there rather than `src/`.

### `coffee.json` is generated — don't hand-edit

It is produced from a Notion "Coffee Shops" database by a script in the **tools**
repo (`~/src/tools/src/coffeemap/sync.ts`, run via `npm run coffeemap` there).
The source of truth is Notion; edits made directly here are overwritten on the
next sync. To change data, edit Notion and re-run the sync, then commit the
resulting diff (the sync writes the file but does **not** commit/push).

Top-level JSON **array**, one element per shop (deduped across visits; sorted by
`url`):

| field    | type   | notes                                                        |
| -------- | ------ | ------------------------------------------------------------ |
| `url`    | string | identity + "open in Google Maps"; unique per shop; array sorted by it |
| `name`   | string | shop name (from Notion)                                      |
| `lat`    | number | latitude (always present)                                    |
| `lng`    | number | longitude (always present)                                   |
| `visits` | array  | one per visit, **oldest first**, no timestamps               |

Each `visits[]` element: `coffee`, `service`, `atmosphere` (`number | null` —
`null` = not rated, `0` = the `0️⃣` option, `1..3` = stars) and `tags` (string
array). `lat`/`lng` are always present — the sync **fails** rather than emit a
shop without coordinates, so the map can trust every pin.

The Actions workflow rebuilds and redeploys on push to `main`.

## Commands

```bash
npm install     # first time / after dependency changes
npm run dev      # local dev server with HMR
npm run build    # type-check + production build into dist/
npm run preview  # serve the built dist/ locally to sanity-check
```

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`dist/` to GitHub Pages. No manual steps once the one-time setup below is done.

### One-time setup (not done yet — needs the human)

1. Create the GitHub repo and add it as `origin`, then push `main`.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Custom domain:** two pieces must agree:
   - Add the domain under Settings → Pages → Custom domain (this makes GitHub
     store a `CNAME`), **and** create `public/CNAME` containing just the domain
     (e.g. `coffee.example.com`) so the build artifact keeps it too.
   - DNS: for an apex domain add GitHub's `A`/`AAAA` records; for a subdomain
     add a `CNAME` record pointing at `<user>.github.io`.
   - Enable "Enforce HTTPS" once the cert is issued.

Because we use a custom domain, `vite.config.ts` has `base: '/'`. If the custom
domain is ever dropped (site served from `<user>.github.io/coffeemap/`), change
`base` to `'/coffeemap/'`.

## Conventions / notes

- Keep it simple — this is a hobby project, not production infra.
- Leaflet needs its CSS imported (`import 'leaflet/dist/leaflet.css'`) and its
  default marker icons need a small fix under bundlers; handle that when the map
  component is actually written.
- No test suite or linter is set up yet; add them only if the project grows.
