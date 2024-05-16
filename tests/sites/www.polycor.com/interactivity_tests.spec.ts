import { test, expect } from "@playwright/test";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { solveCaptcha } from "../../lib/utils/captcha-solver";
import { TEST_MESSAGE } from "../../lib/constants/form";

test.describe("Polycor Homepage", () => {
  test("Navigation Menu", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/moisture_management/?_gl=1*xwrt9e*_gcl_au*MTY5NTY3MDQ3NS4xNzA5MDU4MTcy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwOTI5MzQxMy41Ni4xLjE3MDkyOTM3MDEuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const recentlyViewed = page.locator(".recently-viewed__title", {
      hasText: "Recently Viewed",
    });
    expect.soft(await recentlyViewed.isVisible()).toBeFalsy();
  });
});
