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

See [CLAUDE.md](CLAUDE.md) for architecture and the data model.

## Deployment

The site is a static build published to **GitHub Pages** by a GitHub Actions
workflow. There is no server — `npm run build` produces a `dist/` folder of
plain HTML/CSS/JS, and that folder is what gets served.

### How the workflow works

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every
push to `main` (and can be triggered manually from the Actions tab via
**workflow_dispatch**). It has two jobs:

1. **build** — checks out the repo, installs Node 22, runs `npm ci` then
   `npm run build`, and uploads the resulting `dist/` folder as a Pages
   artifact (`actions/upload-pages-artifact`).
2. **deploy** — takes that artifact and publishes it to Pages
   (`actions/deploy-pages`). It runs in the `github-pages` environment, and the
   live URL shows up on the completed run.

The workflow grants itself the permissions Pages needs (`pages: write`,
`id-token: write`) and a `concurrency` group so a newer push cancels an
in-flight deploy instead of racing it. Nothing is deployed from your laptop —
pushing to `main` is the entire release process.

### One-time GitHub setup

1. **Create the repo and push** (repo:
   [mikemikhaylov/coffeemap](https://github.com/mikemikhaylov/coffeemap)):
   ```bash
   git remote add origin git@github.com:mikemikhaylov/coffeemap.git
   git push -u origin main
   ```
2. **Enable Pages via Actions:** repo **Settings → Pages → Build and deployment
   → Source: GitHub Actions**. (Not the old "Deploy from a branch" option.)
3. Push to `main` (or re-run the workflow). Once it's green the site is live at
   `https://mikemikhaylov.github.io/coffeemap/` — until the custom domain
   (`coffeemap.uk`, configured below) takes over.

### Custom domain — `coffeemap.uk`

`coffeemap.uk` is an **apex** domain (no `www`/subdomain), served from the root,
which is what this repo is already configured for. Two things must agree: the
DNS records you own, and GitHub knowing about the domain. The
[`public/CNAME`](public/CNAME) file is already committed with `coffeemap.uk`.

1. **DNS** (at whoever hosts DNS for `coffeemap.uk`): point the apex at GitHub
   Pages with these `A` records —
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   and, for IPv6, the matching `AAAA` records —
   ```
   2606:50c0:8000::153
   2606:50c0:8001::153
   2606:50c0:8002::153
   2606:50c0:8003::153
   ```
   (If you'd rather also serve `www.coffeemap.uk`, add a `CNAME` record for
   `www` pointing to `mikemikhaylov.github.io`.) Confirm the current IPs against
   GitHub's
   ["Managing a custom domain"](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)
   docs.
2. **Tell GitHub:** Settings → Pages → **Custom domain** → enter `coffeemap.uk`
   and save. GitHub verifies DNS and stores the domain.
3. **`public/CNAME`** (already in the repo) contains just:
   ```
   coffeemap.uk
   ```
   Files in `public/` are copied verbatim into `dist/`, so this keeps the custom
   domain pinned to the build artifact on every deploy (otherwise Pages can
   reset it). If you ever change the domain, edit this file to match.
4. **Enforce HTTPS:** once the certificate is issued (can take a few minutes),
   tick Settings → Pages → **Enforce HTTPS**.

Because the site is served from the domain root, [`vite.config.ts`](vite.config.ts)
sets `base: '/'`. If you ever drop the custom domain and serve from
`https://mikemikhaylov.github.io/coffeemap/` instead, change `base` to
`'/coffeemap/'`.
