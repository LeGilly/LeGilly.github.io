# LeGilly

The hub page for my projects: **https://legilly.com**

Because this is the `LeGilly.github.io` repository, every other repo with GitHub Pages
turned on is served under the same domain, e.g. `legilly.com/ba-halo-game/`.

## Adding a project

In `index.html`, copy one `<article class="card">` block, paste it at the top of the list,
and change the name, description, tags and links. Use `/repo-name/` for the Play link.

Icons: `icon-halo` (halo ring), `icon-hash` (shows the `#` inside), or `icon-letter`
(put any letter inside, e.g. `<div class="icon icon-letter" aria-hidden="true">Q</div>`).

## Versions

The version is shown at the bottom of the page and set in `index.html`, as major.minor.patch:

- **patch** (1.0.**0** → 1.0.**1**): fixes and small visual changes
- **minor** (1.**0**.1 → 1.**1**.0): a new feature
- **major** (**1**.1.0 → **2**.0.0): a big change in what the project is or how it works

For each release, set the new version in `index.html` (the shown version and every `?v=`, so browsers fetch
the fresh files), add an entry to [CHANGELOG.md](CHANGELOG.md), and update the line below.
Current version: 1.1.2.
