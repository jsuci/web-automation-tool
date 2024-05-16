import { test, expect } from "@playwright/test";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { solveCaptcha } from "../../lib/utils/captcha-solver";
import { TEST_MESSAGE } from "../../lib/constants/form";

test.describe("instoneco.com/ - home", () => {
  test("Get To Know Us Button", async () => {
    const url = "https://instoneco.com/"

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
    });

    await page.click("div.n2-ss-layer.n2-ow.n-uc-5iU6B2osqVsX");
    await page.waitForTimeout(1000);

    expect(page.url()).toBe("https://instoneco.com/about/");
  });

  test("Let’s Get Started Button", async () => {
    const url = "https://instoneco.com/"

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
    });

    const button = await page.getByRole("link", { name: "Let’s Get Started" });
    await button.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toBe("https://instoneco.com/let-us-help-you-create-your-next-project/");
  });

  test("Are You A Home Owner Card", async () => {
    const url = "https://instoneco.com/"

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
    });

    const button = await page.locator("a[href='https://instoneco.com/homeowners/']");
    await button.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toBe("https://instoneco.com/homeowners/");
    expect(await page.getByRole("heading", { name: "Homeowners" }).innerText()).toBe("Homeowners");
  });

  test("Are You A Professional Card", async () => {
    const url = "https://instoneco.com/"

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
    });

    const button = await page.locator('div:nth-child(2) > .wp-block-image > a').first()
    await button.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toBe("https://instoneco.com/professionals/");
  });

  test.describe("Category Cards", async () => {
    test("Artepiso", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle",
      });

      const button = await page.getByRole("link", { name: "Artepiso" });
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/Artepiso/");
    });

    test("Aura Natural Landscapes", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle",
      });

      const button = await page.getByRole("link", { name: "Aura Natural Landscapes" });
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/aura/");
    });

    test("Beon Stone", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle",
      });

      const button = await page.getByRole("link", { name: "Beon Stone" });
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/beon-stone/");
    });

    test("Cultured Stone", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle",
      });

      const button = await page.getByRole('link', { name: 'CULTURED STONE', exact: true })
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/cultured-stone/");
    });

    test("Dutch Quality", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url);

      // wait until page content is fully loaded
      await page.waitForLoadState("domcontentloaded");

      const button = await page.locator("a[title='Dutch Quality Ashen Weather Ledge']")
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/dutch-quality/");
    });

    test("Interloc", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url);

      // wait until page content is fully loaded
      await page.waitForLoadState("domcontentloaded");

      const button = await page.locator("a[title='IPS-New-England-Fire-Place-5-2']")
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/interloc/");
    });

    test("ISOKERN FIREPLACES", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url);

      // wait until page content is fully loaded
      await page.waitForLoadState("domcontentloaded");

      const button = await page.getByRole("link", { name: "ISOKERN FIREPLACES", exact: true});
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/isokern-fireplaces/");
    });

    test("PANGAEA NATURAL STONE", async () => {
      const url = "https://instoneco.com/"

      chromium.use(StealthPlugin());
      const browser = await chromium.launch({ headless: true });

      const page = await browser.newPage();

      await page.goto(url);

      // wait until page content is fully loaded
      await page.waitForLoadState("domcontentloaded");

      const button = await page.getByRole("link", { name: "PANGAEA NATURAL STONE", exact: true});
      await button.click();
      await page.waitForTimeout(1000);

      expect(page.url()).toBe("https://instoneco.com/pangaea-natural-stone/");
    });
  });
});

test.describe("https://instoneco.com/let-us-help-you-create-your-next-project", () => {
  test("Request Quote Form", async () => {
    const url = "https://instoneco.com/let-us-help-you-create-your-next-project";
    const formSelector = "form#gform_2";
  
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
  
    const page = await browser.newPage();
  
    await page.goto(url, {
      waitUntil: "networkidle",
    });
  
    await page.getByLabel("First").type("TEST");
    await page.getByLabel("Last").type("TEST");
    await page
      .getByLabel("Email*", { exact: true })
      .fill("jhake@inboundfound.com");
    await page.getByLabel("City", { exact: true }).fill("TEST");
    await page.getByLabel("State").selectOption({ label: "Alabama" });
    await page
      .getByLabel("What best describes you?*")
      .selectOption({ label: "Homeowner" });
    await page
      .getByLabel("Which Product Line Are You Interested In?*")
      .selectOption({ label: "Beon Stone" });
    await page
      .getByLabel("Describe Your Job / How Can We Help?")
      .fill(TEST_MESSAGE);
  
    const solved = await solveCaptcha(
      page,
      "div#input_2_20",
      "#gform_submit_button_2",
      "div.gform_confirmation_message_2",
      "Thanks for reaching out!"
    );
  
    await expect(solved).toBeTruthy();
    browser.close();
  });
});

