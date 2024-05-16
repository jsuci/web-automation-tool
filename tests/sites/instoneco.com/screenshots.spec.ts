import { test, expect, Locator, Page } from "@playwright/test";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import JsonDBWrapper from "../../lib/db/json_db";
import {
  scrollToBottom,
  scrollToTop,
  hideIframes,
} from "../../lib/utils/screenshot-helper";
import S3 from "../../lib/s3";
import { ScreenshotFiles } from "../../lib/types";

const db = new JsonDBWrapper(path.join(__dirname, "crawled_urls.json"));
const config = new JsonDBWrapper(path.join(__dirname, "crawl_config.json"));

const takePagesScreenshots = async (
  page: Page,
  urls: any,
  config: JsonDBWrapper,
  db: JsonDBWrapper,
  domain_key: string,
  screenshotKey: keyof ScreenshotFiles
) => {
  const s3 = new S3();

  const siteName = await config.get("/website_name");
  const domain = await db.get(`/${domain_key}`);
  const runId = await db.get("/current_run");
  const run = await db.get(`/runs`);
  const currentRun = run.find((r: any) => r.id === runId);
  const currentRunIndex = run.findIndex((r: any) => r.id === runId);
  const runFolderPath = currentRun.folder_path;

  let statusCode = 0;

  page.on("response", (response) => {
    if (response.request().resourceType() === "document") {
      statusCode = response.status();
    }
  });

  // const MASKED_ELEMENTS = [page.locator(`//iframe`)];

  console.log("Total links to process: ", urls.length);

  for (const url of urls) {
    console.log(`Processing: ${url.path}`);

    const fullUrl = url.fullURL;

    const urlFolder = fullUrl
      // remove protocol
      .replace(/(^\w+:|^)\/\//, "")
      // replace slashes with underscores
      .replace("/", "_")
      // remove trailing slash
      .replace(/\/$/, "");

    try {
      await page.goto(`${domain}${url.path}`, {
        waitUntil: "load",
      });

      // if status code is not 200, skip
      if (statusCode !== 200) {
        console.log(
          `Invalid URL: ${domain}${url.path} - Status Code: ${statusCode}`
        );
        continue;
      }

      console.info(`URL: ${domain}${url.path} - Status Code: ${statusCode}`);
    } catch (error) {
      console.log(`Invalid URL: ${domain}${url.path}`);
      console.error(error);
      continue;
    }

    await scrollToBottom(page);
    await scrollToTop(page);
    await hideIframes(page);

    const screenshotBuf = await page.screenshot({
      // path: path.join(urlFolderPath, `_staging.png`),
      fullPage: true,
      // mask: MASKED_ELEMENTS,
      // style: CUSTOM_CSS,
      animations: "disabled",
    });

    // save screenshot to s3
    const s3Key = `screenshots/${siteName}/${currentRun.id}/${urlFolder}/_${screenshotKey}.png`;
    await s3.putObject(s3Key, screenshotBuf, "image/png");

    const s3ObjectUrl = s3.getObjectUrl(s3Key);
    const currentScreenshotIndex = currentRun.screenshots.findIndex(
      (s: any) => s.url === fullUrl
    );

    if (currentScreenshotIndex === -1) {
      let screenshotFile: ScreenshotFiles = {};
      screenshotFile[screenshotKey] = s3ObjectUrl;

      currentRun.screenshots.push({
        page_name: urlFolder,
        url: fullUrl,
        screenshot_files: screenshotFile,
      });
    } else {
      currentRun.screenshots[currentScreenshotIndex].screenshot_files[
        screenshotKey
      ] = s3ObjectUrl;
    }

    await db.push(`/runs[${currentRunIndex}]`, currentRun);
  }
};

test.describe("Desktop 1330px Screenshots", () => {
  test.use({ viewport: { width: 1330, height: 720 } });

  test("screenshots: staging", async () => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let urls = await db.get("/urls");
    urls = urls.filter((url: any) => url.status_code === 200);
    let statusCode = 0;

    await takePagesScreenshots(
      page,
      urls,
      config,
      db,
      "staging_domain",
      "staging"
    );

    await page.close();

    expect(urls.length).toBeGreaterThan(0);
  });

  test("screenshots: prod (before update)", async () => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let urls = await db.get("/urls");
    urls = urls.filter((url: any) => url.status_code === 200);
    let statusCode = 0;

    await takePagesScreenshots(
      page,
      urls,
      config,
      db,
      "production_domain",
      "prod_before_update"
    );

    await page.close();

    expect(urls.length).toBeGreaterThan(0);
  });

  test("screenshots: prod (after update)", async () => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let urls = await db.get("/urls");
    urls = urls.filter((url: any) => url.status_code === 200);
    let statusCode = 0;

    await takePagesScreenshots(
      page,
      urls,
      config,
      db,
      "production_domain",
      "prod_after_update"
    );

    await page.close();

    expect(urls.length).toBeGreaterThan(0);
  });
});

test.describe("Mobile 480px Screenshots", () => {
  test.use({ viewport: { width: 480, height: 720 } });

  test("screenshots: staging", async () => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let urls = await db.get("/urls");
    urls = urls.filter((url: any) => url.status_code === 200);
    let statusCode = 0;

    await takePagesScreenshots(
      page,
      urls,
      config,
      db,
      "staging_domain",
      "m_staging"
    );

    await page.close();

    expect(urls.length).toBeGreaterThan(0);
  });

  test("screenshots: prod (before update)", async () => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let urls = await db.get("/urls");
    urls = urls.filter((url: any) => url.status_code === 200);
    let statusCode = 0;

    await takePagesScreenshots(
      page,
      urls,
      config,
      db,
      "production_domain",
      "m_prod_before_update"
    );

    await page.close();

    expect(urls.length).toBeGreaterThan(0);
  });

  test("screenshots: prod (after update)", async () => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let urls = await db.get("/urls");
    urls = urls.filter((url: any) => url.status_code === 200);
    let statusCode = 0;

    await takePagesScreenshots(
      page,
      urls,
      config,
      db,
      "production_domain",
      "m_prod_after_update"
    );

    await page.close();

    expect(urls.length).toBeGreaterThan(0);
  });
});
