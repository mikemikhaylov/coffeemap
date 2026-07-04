# ☕️ Coffee Map

A personal map of coffee shops we've visited. Static single-page app —
Vite + React + TypeScript, Leaflet for the map, hosted on GitHub Pages.

## Develop

```bash
nvm use            # or: nvm install --lts
npm install
npm run dev
```

## Build

```bash
npm run build      # output in dist/
npm run preview    # preview the production build
```

## Add a coffee shop

Append an entry to [`public/data/coffee.json`](public/data/coffee.json) and push
to `main`. GitHub Actions rebuilds and redeploys automatically.

See [CLAUDE.md](CLAUDE.md) for architecture, the data model, and the one-time
GitHub Pages + custom domain setup.
