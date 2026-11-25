// The navigation bar, menus and theme button on every site, using this repo's shared/ files.
import { test, expect } from "@playwright/test";
import { sites, URLS, watchErrors } from "./sites.mjs";

test.beforeEach(async ({ context }) => { await sites(context); });

const CATEGORY = { halo: "Games", idlerpg: "Games", anime: "Tools", privacy: "Tools" };

for (const [key, url] of Object.entries(URLS)) {
  test(`${key}: bar across the top, this project marked, page starts below it`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(url);
    const bar = page.locator(".lg-bar");
    await expect(bar).toBeVisible();
    const box = await bar.boundingBox();
    expect(box.y).toBe(0);
    expect(box.width).toBeGreaterThanOrEqual(1190);
    if (key === "home") await expect(page.locator(".lg-home")).toHaveAttribute("aria-current", "page");
    else await expect(page.locator(".lg-cat.lg-here")).toHaveText(CATEGORY[key]);
    const firstTop = await page.evaluate(() => {
      let n = document.querySelector(".lg-bar").nextElementSibling;
      while (n && (n.tagName === "SCRIPT" || n.hidden)) n = n.nextElementSibling;
      return n.getBoundingClientRect().top;
    });
    expect(firstTop).toBeGreaterThanOrEqual(box.height - 1);
    if (key === "idlerpg") expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    expect(errors).toEqual([]);
  });

  test(`${key}: fits a phone, menus stay on screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await page.goto(url);
    await expect(page.locator(".lg-bar")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const menus = await page.locator(".lg-cat").count();
    expect(menus).toBe(3);
    for (let i = 0; i < menus; i++) {
      await page.locator(".lg-cat").nth(i).click();
      const d = await page.locator(`#lgDrop${i}`).boundingBox();
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x + d.width).toBeLessThanOrEqual(390);
    }
    await page.click(".tp-btn");
    const t = await page.locator(".tp-pop").boundingBox();
    expect(t.x).toBeGreaterThanOrEqual(0);
    expect(t.x + t.width).toBeLessThanOrEqual(390);
  });
}

test("menus: one open at a time, Escape and clicking outside close them", async ({ page }) => {
  await page.goto(URLS.halo);
  await page.click(".lg-cat >> text=Games");
  await expect(page.locator("#lgDrop0")).toBeVisible();
  await expect(page.locator("#lgDrop0 a[aria-current=page]")).toHaveAttribute("href", URLS.halo);
  await expect(page.locator(".lg-cat").first()).toHaveAttribute("aria-expanded", "true");
  await page.click(".lg-cat >> text=Tools");
  await expect(page.locator("#lgDrop0")).toBeHidden();
  await expect(page.locator("#lgDrop1 a")).toHaveAttribute("href", URLS.anime);
  await page.click(".lg-cat >> text=Idle game optimisers");
  await expect(page.locator("#lgDrop1")).toBeHidden();
  await expect(page.locator("#lgDrop2 a")).toHaveAttribute("href", "https://github.com/LeGilly/frozen-cookies-plus");
  await expect(page.locator("#lgDrop2 a")).toContainText("Frozen Cookies Plus");
  await page.keyboard.press("Escape");
  await expect(page.locator("#lgDrop2")).toBeHidden();
  expect(await page.evaluate(() => document.activeElement.classList.contains("lg-cat"))).toBe(true);
  await page.click(".lg-cat >> text=Games");
  await page.mouse.click(600, 600);
  await expect(page.locator("#lgDrop0")).toBeHidden();
  await expect(page.locator(".lg-home")).toHaveAttribute("href", URLS.home);
});

test("Idle game optimisers is shortened to Optimisers on phones", async ({ page }) => {
  await page.goto(URLS.home);
  const cat = page.locator(".lg-cat").nth(2);
  await expect(cat.locator(".lg-long")).toBeVisible();
  await expect(cat.locator(".lg-long")).toHaveText("Idle game optimisers");
  await expect(cat.locator(".lg-short")).toBeHidden();
  await page.setViewportSize({ width: 390, height: 760 });
  await expect(cat.locator(".lg-short")).toBeVisible();
  await expect(cat.locator(".lg-short")).toHaveText("Optimisers");
  await expect(cat.locator(".lg-long")).toBeHidden();
});

test("a theme picked on one site is used on all of them; IdleRPG stays dark", async ({ page }) => {
  await page.goto(URLS.halo);
  await page.click(".tp-btn");
  await page.click(".tp-pop .tp-rose");
  await page.click("[data-tp-mode=dark]");
  const look = () => page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.mode].join("."));
  expect(await look()).toBe("rose.dark");
  await page.mouse.click(600, 600);
  await expect(page.locator(".tp-pop")).toBeHidden();
  for (const url of [URLS.home, URLS.anime, URLS.idlerpg]) {
    await page.goto(url);
    await expect(page.locator(".lg-bar")).toBeVisible();
    expect(await look()).toBe("rose.dark");
  }
  await page.click(".tp-btn");
  await expect(page.locator("[data-tp-mode=light]")).toBeHidden();   // IdleRPG only has a dark look
  await page.click(".tp-pop .tp-teal");
  expect(await look()).toBe("teal.dark");
  await page.goto(URLS.anime);
  await expect(page.locator(".lg-bar")).toBeVisible();
  expect(await look()).toBe("teal.dark");
});

test("the phone address bar colour follows the theme", async ({ page }) => {
  await page.goto(URLS.home);
  await expect(page.locator(".tp-btn")).toBeVisible();
  const colours = () => page.evaluate(() => [document.querySelector("meta[name=theme-color]").content,
    getComputedStyle(document.documentElement).getPropertyValue("--card").trim()]);
  let [meta, card] = await colours();
  expect(meta).toBe(card);
  await page.click(".tp-btn");
  await page.click(".tp-pop .tp-teal");
  await page.click("[data-tp-mode=dark]");
  [meta, card] = await colours();
  expect(meta).toBe(card);
  expect(meta).not.toBe("#ffffff");
});

for (const key of ["home", "halo", "anime"]) {
  test(`${key}: never shown inside another site's frame`, async ({ page }) => {
    await page.route("https://framer.test/", (r) => r.fulfill({ contentType: "text/html", body: `<iframe id="f" src="${URLS[key]}" width="800" height="600"></iframe>` }));
    await page.goto("https://framer.test/");
    await page.waitForTimeout(1500);
    if (page.url().startsWith("https://framer.test")) {
      const inner = page.frames().find((f) => f !== page.mainFrame());
      expect(await inner.evaluate(() => document.documentElement.hidden)).toBe(true);
    } else {
      expect(page.url()).toBe(URLS[key]);   // the page took over the whole tab instead
    }
  });
}
