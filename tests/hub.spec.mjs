// The hub page itself.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { sites, URLS } from "./sites.mjs";

const file = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test.beforeEach(async ({ context }) => { await sites(context); });

test("every project in the bar has a card, and the cards lead to the same places", async ({ page }) => {
  await page.goto(URLS.home);
  await expect(page.locator(".lg-bar")).toBeVisible();
  const inBar = await page.locator(".lg-drop a").evaluateAll((as) => as.map((a) => a.href));
  const cards = await page.locator(".card h3 a").evaluateAll((as) => as.map((a) => a.href));
  expect(cards.sort()).toEqual(inBar.sort());
  // The main button opens the project; a mod (not a website) has Download, to its latest release instead.
  for (const card of await page.locator(".card").all()) {
    const main = await card.locator("h3 a").getAttribute("href").then((h) => new URL(h, URLS.home).href);
    const btn = card.locator(".btn");
    if ((await btn.textContent()) === "Download") await expect(btn).toHaveAttribute("href", main + "/releases/latest");
    else expect(await btn.evaluate((a) => a.href)).toBe(main);
  }
});

test("the cards are grouped under the bar's menus, in the same order", async ({ page }) => {
  await page.goto(URLS.home);
  await expect(page.locator(".lg-bar")).toBeVisible();
  const groups = await page.evaluate(() => ({
    bar: [...document.querySelectorAll(".lg-menu")].map((m) => [
      (m.querySelector(".lg-long") || m.querySelector(".lg-cat")).textContent.trim(),
      [...m.querySelectorAll(".lg-drop a")].map((a) => a.href)]),
    page: [...document.querySelectorAll("section.group")].map((s) => [
      s.querySelector("h2").textContent.trim(),
      [...s.querySelectorAll(".card h3 a")].map((a) => a.href)]),
  }));
  expect(groups.page.map((g) => g[0])).toEqual(["Games", "Tools", "Idle game optimisers"]);
  expect(groups.page.map((g) => [g[0], g[1].sort()])).toEqual(groups.bar.map((g) => [g[0], g[1].sort()]));
});

test("Source links open in a new tab", async ({ page }) => {
  await page.goto(URLS.home);
  const links = page.locator(".card a.link");
  await expect(links).toHaveCount(await page.locator(".card").count());
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute("target", "_blank");
    await expect(a).toHaveAttribute("rel", /noopener/);
    await expect(a).toHaveAttribute("href", /^https:\/\/github\.com\/LeGilly\//);
  }
});

test("the version on the page matches the changelog and the style link", async ({ page }) => {
  const latest = file("CHANGELOG.md").match(/^## \[?v?(\d+\.\d+\.\d+)/m)[1];
  await page.goto(URLS.home);
  await expect(page.locator("footer .version")).toHaveText("v" + latest);
  expect(file("index.html")).toContain(`style.css?v=${latest}`);
});

test("blue theme dot shows two shades like the others", async ({ page }) => {
  await page.goto(URLS.home);
  await page.click(".tp-btn");
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector(".tp-dot.tp-blue")).backgroundImage);
  expect(bg).toContain("0, 115, 218");
  expect(bg).toContain("18, 138, 250");
});
