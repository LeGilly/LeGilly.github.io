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

The version shown at the bottom of the page is in `index.html`.
For each release, raise it by one and set the `?v=` number in `index.html` to the same value,
so browsers fetch the fresh CSS. Current version: 1.
