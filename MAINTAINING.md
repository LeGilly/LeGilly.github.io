# Maintaining legilly.com (all projects)

Notes for whoever works on these projects (including AI assistants). **This file holds what applies to every
project**; each project's own `MAINTAINING.md` only covers what's specific to it. The READMEs describe the
apps; decisions and how things are built go in these files.

## The projects

| Repo (under `Documents\GitHub`) | Address | Kind |
|---|---|---|
| `LeGilly.github.io` | https://legilly.com | The hub, and the code shared by every site (`shared/`) |
| `anime-dashboard` | https://anime.legilly.com | Tool (with a Cloudflare relay at api.legilly.com) |
| `ba-halo-game` | https://legilly.com/ba-halo-game/ | Game |
| `irc-idlerpg-web` | https://legilly.com/irc-idlerpg-web/ | Game (the one the owner returns to least: keep changes minimal) |

## How the owner works

- Changes are committed and pushed by the owner with GitHub Desktop. An assistant writes files into the repo
  folders and suggests a one-line commit summary; it doesn't commit or push.
- Keep each file's line endings as they are (the two game repos use Windows CRLF on the owner's PC).
- READMEs describe only what the app does and how it works; no process or decisions.
- Whenever something is decided or changed in how a project works, update the matching `MAINTAINING.md`.

## Versions and releases (every project)

1. Versions are major.minor.patch: patch = fixes and small visual changes, minor = a new feature,
   major = a big change in what the project is or does.
2. Set the new version where each project shows it (listed in its `MAINTAINING.md`): the visible `vX.Y.Z`
   and every `?v=` on its own CSS/JS, so browsers fetch the fresh files.
3. Add an entry at the top of the project's `CHANGELOG.md`: `## X.Y.Z · YYYY-MM-DD`, then one short line per change.
4. Changes that don't show (README, MAINTAINING, comments) need no new version.
5. Pages themselves (the HTML) can stay cached in a browser for up to 10 minutes after a push (GitHub Pages);
   Ctrl+F5 shows the new one at once.

## Rules for every site

- **Content security policy** in a meta tag on every page: `default-src 'none'`, scripts and styles only from
  the site itself and `https://legilly.com` (the shared code), no inline scripts or styles, `base-uri 'none'`,
  `form-action 'none'`. Sizes that depend on data are set from JS, never with `style="…"`.
- No third-party scripts, fonts, trackers or CDNs on any legilly.com site.
- Two-factor sign-in is on for the owner's GitHub and Cloudflare accounts: the hub repo runs code on every
  site, and Cloudflare holds the dashboard's MyAnimeList keys. Keep it that way.
- The shared script refuses to show a page inside another site's frame (GitHub Pages can't send the header
  that normally forbids it).

## Shared code: navigation bar and colour themes

- One script and one stylesheet are shared by every legilly.com site. They live **only in the hub repo**
  (`LeGilly.github.io/shared/site.js` and `site.css`) and every site loads them from
  `https://legilly.com/shared/`, in `<head>` before its own stylesheet. A change there reaches every site
  within about 10 minutes of pushing the hub (GitHub Pages cache), with no commit in the other repos.
  So test a change on all four sites before pushing the hub: a mistake breaks every site at once.
- Each page says which project it belongs to: `<html data-lg-project="home|anime|halo|idlerpg">`
  (highlights it in the bar). `<html data-tp-dark-only>` keeps a site dark (IdleRPG).
- **The bar** (top of every page, 46 px, `--lg-bar-h`): home icon → hub; **Games** and **Tools** menus
  listing every project (current one highlighted); theme button on the right. The project list is
  `GROUPS` at the top of `site.js`. The bar replaced every "← All projects" link: don't add back links.
  Pages get `padding-top` for it from the start (`html.lg-bar-on`), so nothing jumps when it's drawn.
- **Themes:** the script reads the `legilly_theme` cookie (`theme.mode`, e.g. `purple.dark`;
  `Domain=legilly.com` so every subdomain shares it; localStorage elsewhere, e.g. localhost) and sets
  `data-theme` (blue, purple, teal, amber, rose) and `data-mode` (light or dark, System resolved) on `<html>`
  before the page draws. `site.css` defines `--bg --card --ink --muted --accent --accent-ink --line --tag
  --track --shadow` per theme and mode; site stylesheets don't redefine these.
- **Base styles** every site shares are in `site.css` (section 3): `* { box-sizing }`, the `body` font and
  colours, links and the accent in titles (`h1 span`). Only rules identical on every site go there; a site
  changes them in its own stylesheet (IdleRPG does, for its dark monospace look). Check all sites when editing.
- The script also sets `<meta name="theme-color">` (the phone's address bar) to the bar's colour.
- Text on an accent background uses `var(--accent-ink)`: white in light mode and for Blue in dark mode;
  dark text on the lighter dark-mode accents of the other themes.
- Dark-only rules are written as `:root[data-mode="dark"] …`, plus `@media (prefers-color-scheme: dark)
  { :root:not([data-mode]) … }` as a fallback without the script.
- How the palettes were made: the blue neutrals with only the hue rotated (same lightness, so the same
  contrast); accents chosen by calculation, with at least the old blue's contrast and at least as far from the
  dashboard's status colours as the blue is from "Plan to watch". Check any new theme the same way.
- Security rules: sites on legilly.com allow `script-src`/`style-src` `'self' https://legilly.com`; Anime
  Dashboard (anime.legilly.com) needs `https://legilly.com` listed for both.


### Adding a project

1. Hub card: in `index.html`, copy one `<article class="card">` block, paste it at the top of the list, and change
   the name, description, tags and links (`/repo-name/` for a project under legilly.com). Icons: `icon-halo`,
   `icon-hash` (shows the `#`), or `icon-letter` (put a letter inside). Open/Play links stay in the same tab;
   Source links open a new tab (`target="_blank" rel="noopener"`).
2. Bar: add it to `GROUPS` in `shared/site.js` (Games or Tools: name, one-line description, address, `id`).
3. The project's pages: `<html data-lg-project="id">`, the shared files in `<head>`, and the security rule above.
4. The hub README: one line for it. Add the table row above, and give the project its own `MAINTAINING.md`
   that starts by pointing here.

## The hub itself

- This is the `LeGilly.github.io` repository, published by GitHub Pages; `CNAME` points it at `legilly.com`.
  Every other repo with GitHub Pages turned on is served under the same domain (`legilly.com/ba-halo-game/`);
  Anime Dashboard has its own subdomain.
- DNS for legilly.com is managed in Cloudflare: the GitHub Pages records for legilly.com and anime.legilly.com,
  and `api.legilly.com`, the custom domain of the dashboard's relay (a Cloudflare Worker).
- Files: `index.html` (the page), `style.css`, `shared/` (site.js, site.css).
- Version: in `index.html`, the footer `vX.Y.Z` and the `?v=` on style.css.
- Testing a change to `shared/`: serve each repo locally and have the browser load `https://legilly.com/shared/`
  from the local hub folder (e.g. Playwright `route`), then check all four sites, light and dark, and a phone width.
