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
  const cards = await page.locator(".card h2 a").evaluateAll((as) => as.map((a) => a.href));
  expect(cards.sort()).toEqual(inBar.sort());
  const opens = await page.locator(".card .btn").evaluateAll((as) => as.map((a) => a.href));
  expect(opens.sort()).toEqual(inBar.sort());
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
