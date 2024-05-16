import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import JsonDBWrapper from "../../lib/db/json_db";
import {
  compareSaveImages,
  fetchImageData,
} from "../../lib/utils/screenshot-helper";
import S3 from "../../lib/s3";
import {
  PageScreeenshotsData,
  ComparisonScores,
  ScreenshotFiles,
} from "../../lib/types";
import { error } from "console";

const db = new JsonDBWrapper(path.join(__dirname, "crawled_urls.json"));
const config = new JsonDBWrapper(path.join(__dirname, "crawl_config.json"));

const startCompareScreenshots = async () => {
  const s3 = new S3();

  const siteName = await config.get("/website_name");
  const runId = await db.get("/current_run");
  const run = await db.get(`/runs`);
  const currentRun = run.find((r: any) => r.id === runId);
  const currentRunIndex = run.findIndex((r: any) => r.id === runId);
  const screenshots: PageScreeenshotsData[] = currentRun["screenshots"];

  if (screenshots.length === 0) {
    throw new Error("No screenshots found.");
  }

  for (const itemSC of screenshots) {
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

      // process sprod_after vs prod_before
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
};

test("start comparing screenshots", async ({ page }) => {
  await startCompareScreenshots();
});
