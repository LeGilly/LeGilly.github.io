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

`index.html` (the page), `style.css`, and the shared `theme.css` / `theme.js`.

## Adding a project

In `index.html`, copy one `<article class="card">` block, paste it at the top of the list, and change the
name, description, tags and links. Use `/repo-name/` for a project hosted under legilly.com.
Icons: `icon-halo` (halo ring), `icon-hash` (shows the `#` inside), or `icon-letter` (put any letter inside,
e.g. `<div class="icon icon-letter" aria-hidden="true">Q</div>`). Open/Play links stay in the same tab;
Source links open a new tab (`target="_blank" rel="noopener"`). Also add the project to the README list.

## Releasing

1. Version is major.minor.patch: patch = fixes and small visual changes, minor = a new feature (or a new
   project card), major = a big change in what the hub is or does.
2. Set it in `index.html`: footer `vX.Y.Z` and the `?v=` on style.css.
3. Add an entry at the top of `CHANGELOG.md` (`## X.Y.Z · YYYY-MM-DD`, one short line per change).

## Constraints

- **Content security policy** (meta tag): `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:`.
  Scripts only from this site (`script-src 'self'`), which `theme.js` needs.
- No third-party scripts, fonts or trackers on legilly.com: the sites under it share browser storage.
- The color variables (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--line`, …) match the Halo game
  and Anime Dashboard, so the sites look like one family.

## Colour themes (shared by all legilly.com sites)

- `theme.css` and `theme.js` are shared by the hub, Anime Dashboard, Who's that Halo? and IdleRPG Web and must
  stay **identical in every repo**: change them in one, copy them to the other three, and release each site.
- `theme.js` is loaded in `<head>` before the stylesheets. It reads the `legilly_theme` cookie (`theme.mode`,
  e.g. `purple.dark`; `Domain=legilly.com` so every subdomain shares it; falls back to localStorage elsewhere,
  e.g. localhost), sets `data-theme` (blue, purple, teal, amber, rose) and `data-mode` (light or dark, with
  System resolved) on `<html>`, and adds the theme button in the page's top-right corner, or inside an
  element marked `data-tp-slot`. `<html data-tp-dark-only>` keeps a site dark.
- `theme.css` defines `--bg --card --ink --muted --accent --accent-ink --line --tag --track --shadow` for each
  theme in light and dark, plus the button and panel styles. Site stylesheets don't redefine these.
- Text on an accent background uses `var(--accent-ink)`: white in light mode; dark text on the lighter
  dark-mode accents (all but blue).
- Dark-only rules are written as `:root[data-mode="dark"] …`, plus `@media (prefers-color-scheme: dark)
  { :root:not([data-mode]) … }` as a fallback without the script.
- How the palettes were made: the blue neutrals with only the hue rotated (same lightness, so the same
  contrast); accents chosen by calculation, with at least the blue's contrast and at least as far from the
  dashboard's status colours as the blue is from "Plan to watch". Check any new theme the same way.
