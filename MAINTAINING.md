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

`index.html` (the page), `style.css`. No scripts at all today.

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

- **Content security policy** (meta tag): `default-src 'none'; style-src 'self'; img-src 'self' data:`.
  It allows no scripts; adding one means adding `script-src 'self'` (and nothing from other sites).
- No third-party scripts, fonts or trackers on legilly.com: the sites under it share browser storage.
- The color variables (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--line`, …) match the Halo game
  and Anime Dashboard, so the sites look like one family.

## Planned

- **Theme picker** shared by all sites: Blue (current), Purple, Green/teal, Amber, Rose, each with light and
  dark versions, plus System/Light/Dark. Saved in a cookie readable by every legilly.com subdomain (theme
  name only), because anime.legilly.com doesn't share browser storage with legilly.com. Each site keeps its
  own small copy of the theme script (security policy: scripts only from the same site). Here the picker
  goes in the footer, as a row of color dots.
