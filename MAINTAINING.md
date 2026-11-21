# Maintaining the hub (legilly.com)

Notes for whoever works on this repo (including AI assistants). The README says what the hub is; this file
covers how it's built and released.

## How the owner works

- Changes are committed and pushed by the owner with GitHub Desktop, from `Documents\GitHub\LeGilly.github.io`.
  An assistant writes files into that folder and suggests a one-line commit summary; it doesn't commit.
- Projects: `anime-dashboard` (own domain, anime.legilly.com), `ba-halo-game`, `irc-idlerpg-web`,
  all under the owner's `Documents\GitHub`.

## How it's served

- This is the `LeGilly.github.io` repository, published by GitHub Pages; `CNAME` points it at `legilly.com`.
- Every other repo of the owner with GitHub Pages turned on is served under the same domain, e.g.
  `legilly.com/ba-halo-game/`. Anime Dashboard has its own subdomain instead (anime.legilly.com).
- DNS for legilly.com is managed in Cloudflare: the GitHub Pages records for legilly.com and
  anime.legilly.com, and `api.legilly.com`, the custom domain of the dashboard's relay (a Cloudflare Worker).

## Layout

`index.html` (the page), `style.css`, and `shared/` (the code shared by every site, see below).

## Adding a project

In `index.html`, copy one `<article class="card">` block, paste it at the top of the list, and change the
name, description, tags and links. Use `/repo-name/` for a project hosted under legilly.com.
Icons: `icon-halo` (halo ring), `icon-hash` (shows the `#` inside), or `icon-letter` (put any letter inside,
e.g. `<div class="icon icon-letter" aria-hidden="true">Q</div>`). Open/Play links stay in the same tab;
Source links open a new tab (`target="_blank" rel="noopener"`). Also add the project to the README list.
Then add it to the navigation bar too (see "Adding a project to the bar" below).

## Releasing

1. Version is major.minor.patch: patch = fixes and small visual changes, minor = a new feature (or a new
   project card), major = a big change in what the hub is or does.
2. Set it in `index.html`: footer `vX.Y.Z` and the `?v=` on style.css.
3. Add an entry at the top of `CHANGELOG.md` (`## X.Y.Z · YYYY-MM-DD`, one short line per change).

## Constraints

- **Content security policy** (meta tag): `default-src 'none'; script-src 'self' https://legilly.com;
  style-src 'self' https://legilly.com; img-src 'self' data:`.
- No third-party scripts, fonts or trackers on legilly.com: the sites under it share browser storage.
- The color variables (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--line`, …) match the Halo game
  and Anime Dashboard, so the sites look like one family.

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
- Text on an accent background uses `var(--accent-ink)`: white in light mode and for Blue in dark mode;
  dark text on the lighter dark-mode accents of the other themes.
- Dark-only rules are written as `:root[data-mode="dark"] …`, plus `@media (prefers-color-scheme: dark)
  { :root:not([data-mode]) … }` as a fallback without the script.
- How the palettes were made: the blue neutrals with only the hue rotated (same lightness, so the same
  contrast); accents chosen by calculation, with at least the old blue's contrast and at least as far from the
  dashboard's status colours as the blue is from "Plan to watch". Check any new theme the same way.
- Security rules: sites on legilly.com allow `script-src`/`style-src` `'self' https://legilly.com`; Anime
  Dashboard (anime.legilly.com) needs `https://legilly.com` listed for both.

### Adding a project to the bar

Add it to `GROUPS` in `shared/site.js` (Games or Tools: name, one-line description, address, an `id`), give its
page `<html data-lg-project="id">`, and load the shared files in its `<head>`. Also add its card to `index.html`
and its line to the README.
