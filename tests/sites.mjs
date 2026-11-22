// Puts this folder's files in place of the live hub (https://legilly.com/, shared/ included),
// so every site is tested with the shared files as they are here, before they are pushed.
// The other sites load live, unless LEGILLY_SITES points at a folder holding their repos
// (ba-halo-game, irc-idlerpg-web, anime-dashboard) for offline runs.
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = fileURLToPath(new URL("..", import.meta.url));
const OTHERS = process.env.LEGILLY_SITES;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

function serve(route, dir, path) {
  let file = normalize(join(dir, decodeURIComponent(path)));
  if (!file.startsWith(normalize(dir))) return route.fulfill({ status: 403 });
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return route.fulfill({ status: 404, body: "not found" });
  return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] || "application/octet-stream" });
}

export const URLS = {
  home: "https://legilly.com/",
  halo: "https://legilly.com/ba-halo-game/",
  idlerpg: "https://legilly.com/irc-idlerpg-web/",
  anime: "https://anime.legilly.com/",
  privacy: "https://anime.legilly.com/privacy.html",
};

export async function sites(context) {
  await context.route(/^https:\/\/legilly\.com\//, (route) => {
    const path = new URL(route.request().url()).pathname;
    const other = path.match(/^\/(ba-halo-game|irc-idlerpg-web)(\/|$)/);
    if (!other) return serve(route, HUB, path);
    return OTHERS ? serve(route, join(OTHERS, other[1]), path.slice(other[0].length)) : route.continue();
  });
  await context.route(/^https:\/\/anime\.legilly\.com\//, (route) =>
    OTHERS ? serve(route, join(OTHERS, "anime-dashboard"), new URL(route.request().url()).pathname) : route.continue());
  // Nobody is signed in to the dashboard during these tests.
  await context.route(/^https:\/\/api\.legilly\.com\//, (route) => route.fulfill({ status: 401, json: { error: "not signed in" } }));
}

export function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return errors;
}
