import { test } from "@playwright/test";
import path from "path";
import JsonDBWrapper from "../../lib/db/json_db";
import {
  compareSaveImages,
  fetchImageData,
  processNextURLS,
} from "../../lib/utils/screenshot-helper";
import S3 from "../../lib/s3";
import { PageScreeenshotsData } from "../../lib/types";

const db = new JsonDBWrapper(path.join(__dirname, "crawled_urls.json"));
const config = new JsonDBWrapper(path.join(__dirname, "crawl_config.json"));
const logsDB = new JsonDBWrapper(path.join("tests", "lib", "db", "logs.json"));

const startDesktopCompareScreenshots = async () => {
  const s3 = new S3();

  const siteName = await config.get("/website_name");
  const runId = await db.get("/current_run");
  const run = await db.get(`/runs`);
  const currentRun = run.find((r: any) => r.id === runId);
  const currentRunIndex = run.findIndex((r: any) => r.id === runId);
  const screenshots: PageScreeenshotsData[] = currentRun["screenshots"];

  const lastURL: string = await logsDB.get("/lastURL");
  const nextItems = await processNextURLS(lastURL, screenshots);

  console.log("Total URLS to process: ", nextItems.length);

  if (screenshots.length === 0) {
    throw new Error("No screenshots found.");
  }

  for (const itemSC of nextItems) {
    await logsDB.push("/lastURL", itemSC.url);
    console.log("Processing page: ", itemSC.page_name);
    const scFiles = itemSC.screenshot_files;
    const urlFolder = itemSC.page_name;

    if (
      scFiles &&
      scFiles.staging &&
      scFiles.prod_before_update &&
      scFiles.prod_after_update
    ) {
      const stagingBuff = await fetchImageData(scFiles.staging);
      const prodBeforeBuff = await fetchImageData(scFiles.prod_before_update);
      const prodAfterBuff = await fetchImageData(scFiles.prod_after_update);

      // process staging vs prod_before
      const staging_vs_prod_before_s3Key = `screenshots/${siteName}/${currentRun.id}/${urlFolder}/_staging_vs_prod_before.png`;
      const [staging_vs_prod_before_score, staging_vs_prod_before_url] =
        await compareSaveImages(
          stagingBuff,
          prodBeforeBuff,
          staging_vs_prod_before_s3Key
        );

      // process prod_after vs prod_before
      const prod_after_vs_prod_before_s3Key = `screenshots/${siteName}/${currentRun.id}/${urlFolder}/_prod_after_vs_prod_before.png`;
      const [prod_after_vs_prod_before_score, prod_after_vs_prod_before_url] =
        await compareSaveImages(
          prodAfterBuff,
          prodBeforeBuff,
          prod_after_vs_prod_before_s3Key
        );

      const currentScreenshotIndex = currentRun.screenshots.findIndex(
        (s: any) => s.url === itemSC.url
      );

      const currentScreenshot: PageScreeenshotsData =
        currentRun.screenshots[currentScreenshotIndex];

      if (!currentScreenshot.screenshot_files) {
        currentScreenshot.screenshot_files = {};
      } else {
        currentScreenshot.screenshot_files.staging_vs_prod_before =
          staging_vs_prod_before_url;
        currentScreenshot.screenshot_files.prod_after_vs_prod_before =
          prod_after_vs_prod_before_url;
      }

      if (!currentScreenshot.comparison_score) {
        currentScreenshot.comparison_score = {
          staging_vs_prod_before: staging_vs_prod_before_score,
          prod_after_vs_prod_before: prod_after_vs_prod_before_score,
        };
      } else {
        currentScreenshot.comparison_score.staging_vs_prod_before =
          staging_vs_prod_before_score;
        currentScreenshot.comparison_score.prod_after_vs_prod_before =
          prod_after_vs_prod_before_score;
      }

      await db.push(
        `/runs[${currentRunIndex}]/screenshots[${currentScreenshotIndex}]`,
        currentScreenshot
      );
    }
  }

  await logsDB.push("/lastURL", "");
};

const startMobileCompareScreenshots = async () => {
  const s3 = new S3();

  const siteName = await config.get("/website_name");
  const runId = await db.get("/current_run");
  const run = await db.get(`/runs`);
  const currentRun = run.find((r: any) => r.id === runId);
  const currentRunIndex = run.findIndex((r: any) => r.id === runId);
  const screenshots: PageScreeenshotsData[] = currentRun["screenshots"];

  const lastURL: string = await logsDB.get("/lastURL");
  const nextItems = await processNextURLS(lastURL, screenshots);

  console.log("Total URLS to process: ", nextItems.length);

  if (screenshots.length === 0) {
    throw new Error("No screenshots found.");
  }

  for (const itemSC of nextItems) {
    await logsDB.push("/lastURL", itemSC.url);
    console.log("Processing page: ", itemSC.page_name);
    const scFiles = itemSC.screenshot_files;
    const urlFolder = itemSC.page_name;

    if (
      scFiles &&
      scFiles.m_staging &&
      scFiles.m_prod_before_update &&
      scFiles.m_prod_after_update
    ) {
      const m_stagingBuff = await fetchImageData(scFiles.m_staging);
      const m_prodBeforeBuff = await fetchImageData(
        scFiles.m_prod_before_update
      );
      const m_prodAfterBuff = await fetchImageData(scFiles.m_prod_after_update);

      // process staging vs prod_before
      const m_staging_vs_prod_before_s3Key = `screenshots/${siteName}/${currentRun.id}/${urlFolder}/_m_staging_vs_prod_before.png`;
      const [m_staging_vs_prod_before_score, m_staging_vs_prod_before_url] =
        await compareSaveImages(
          m_stagingBuff,
          m_prodBeforeBuff,
          m_staging_vs_prod_before_s3Key
        );

      // process sprod_after vs prod_before
      const m_prod_after_vs_prod_before_s3Key = `screenshots/${siteName}/${currentRun.id}/${urlFolder}/_m_prod_after_vs_prod_before.png`;
      const [
        m_prod_after_vs_prod_before_score,
        m_prod_after_vs_prod_before_url,
      ] = await compareSaveImages(
        m_prodAfterBuff,
        m_prodBeforeBuff,
        m_prod_after_vs_prod_before_s3Key
      );

      const currentScreenshotIndex = currentRun.screenshots.findIndex(
        (s: any) => s.url === itemSC.url
      );

      const currentScreenshot: PageScreeenshotsData =
        currentRun.screenshots[currentScreenshotIndex];

      if (!currentScreenshot.screenshot_files) {
        currentScreenshot.screenshot_files = {};
      } else {
        currentScreenshot.screenshot_files.m_staging_vs_prod_before =
          m_staging_vs_prod_before_url;
        currentScreenshot.screenshot_files.m_prod_after_vs_prod_before =
          m_prod_after_vs_prod_before_url;
      }

      if (!currentScreenshot.comparison_score) {
        currentScreenshot.comparison_score = {
          m_staging_vs_prod_before: m_staging_vs_prod_before_score,
          m_prod_after_vs_prod_before: m_prod_after_vs_prod_before_score,
        };
      } else {
        currentScreenshot.comparison_score.m_staging_vs_prod_before =
          m_staging_vs_prod_before_score;
        currentScreenshot.comparison_score.m_prod_after_vs_prod_before =
          m_prod_after_vs_prod_before_score;
      }

      await db.push(
        `/runs[${currentRunIndex}]/screenshots[${currentScreenshotIndex}]`,
        currentScreenshot
      );
    }
  }

  await logsDB.push("/lastURL", "");
};

test("Start Comparing Dekstop Screenshots", async ({ page }) => {
  await startDesktopCompareScreenshots();
});

test("Start Comparing Mobile Screenshots", async ({ page }) => {
  await startMobileCompareScreenshots();
});
