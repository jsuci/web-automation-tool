import { test, expect } from "@playwright/test";
import { PlaywrightCrawler, Sitemap, Configuration } from "crawlee";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";

import { uid } from "uid/secure";
import JsonDBWrapper from "../../lib/db/json_db";

import {
  hasForm,
  hasGoogleRecaptcha,
  doesURLMatch,
} from "../../lib/utils/crawler-helper";

const db = new JsonDBWrapper(path.join(__dirname, "crawled_urls.json"));
const config = new JsonDBWrapper(path.join(__dirname, "crawl_config.json"));
const allSites = new JsonDBWrapper(
  path.join("tests", "lib", "db", "all_sites.json")
);

// test configuration
test.describe.configure({
  mode: "serial", // run test in series
  // retries: 2,
  // timeout: 20_000,
});

test("start a QA process", async () => {
  console.log("start a QA process....");
  const now = dayjs();
  const thisFileParentFolder: string = __dirname.split(path.sep).pop() || "";
  const runId = `run_${thisFileParentFolder}_${now.format(
    "YYYYMMDD_HHmmss"
  )}_${uid(4)}`;

  let folderPath = path.join("screenshots", thisFileParentFolder);
  folderPath = path.join(folderPath, runId);
  console.log(`Creating folder: ${folderPath}`);

  const sites = await allSites.get("/sites");
  const websiteName = await config.get("/website_name");
  const site = sites.find((site: any) => site.website_name === websiteName);

  if (!site) {
    const crawlConfig = await config.get("/");
    console.log("crawlConfig", crawlConfig);
    await allSites.push("/sites[]", crawlConfig);
  }

  await db.push("/current_run", runId);

  await db.push("/runs[]", {
    id: runId,
    folder_path: folderPath,
    started: now.toISOString(),
    finished: null,
    screenshots: [],
  });

  // Expect thisFileParentFolder to be "instoneco.com"
  // await expect(thisFileParentFolder).toBe("instoneco.com");
});

test("start crawler", async () => {
  console.log("start crawler....");
  type UrlEntry = {
    id: string;
    path: string;
    fullURL: string;
    content_type: string;
    status_code: string;
    redirects_to: string | null;
    with_form: boolean;
    with_captcha: boolean;
  };

  const prodDomain = await db.get("/production_domain");
  const prevData: UrlEntry[] = await db.get("/urls");
  const prevPaths = prevData.map((entry) => entry.path);
  const crawlType = await config.get("/crawl_type");

  const excludeURLPatterns: string[] = await config.get(
    "/exlcude_url_patterns"
  );
  const includeURLPatterns: string[] = await config.get(
    "/include_url_patterns"
  );

  const sitemapList: string[] = await config.get("/sitemap_list");
  const includeImages: boolean = await config.get("/include_images");
  const useSitemaps: boolean = await config.get("/use_sitemaps");
  const strictCrawl: boolean = await config.get("/strict_crawl");

  const lastEntry =
    prevData.length != 0
      ? `${prodDomain}${prevPaths[prevData.length - 1]}`
      : prodDomain;

  // start crawling
  let currentStatusCode = 200;
  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: {
        headless: true,
      },
    },
    sessionPoolOptions: { blockedStatusCodes: [] },
    maxRequestsPerMinute: 10,
    minConcurrency: 5,
    maxConcurrency: 10,

    preNavigationHooks: [
      async ({ page, request }, gotoOptions) => {
        page.on("response", async (response) => {
          if (response.url() == request.url) {
            currentStatusCode = response.status();
          }
        });
      },
    ],

    requestHandler: async ({ page, response, request, enqueueLinks }) => {
      let reqURL = new URL(request.url);

      // Define pageInfo
      let pageInfo = {
        id: request.id,
        path: `${reqURL.pathname}`,
        fullURL: `${reqURL.href}`,
        content_type: response?.headers()["content-type"],
        status_code: currentStatusCode,
        redirects_to: null as string | null,
        with_form: await hasForm(page),
        with_captcha: await hasGoogleRecaptcha(page),
        screenshots: null,
      };

      if (currentStatusCode > 300 && currentStatusCode < 400) {
        pageInfo.redirects_to = new URL(`${request.loadedUrl}`).pathname;
      }

      if (useSitemaps === false) {
        await enqueueLinks({
          strategy: crawlType,
        });
      }

      if (useSitemaps === true && includeURLPatterns.length !== 0) {
        const regexURLPatterns = includeURLPatterns.map(
          (pattern) => new RegExp(pattern)
        );
        await enqueueLinks({
          strategy: crawlType,
          regexps: regexURLPatterns,
        });
      }

      if (includeImages === true) {
        const imageSrcs = await page.$$eval("img", (imgs) =>
          imgs.map((img) => img.getAttribute("src")).filter((src) => !!src)
        );

        for (const src of imageSrcs) {
          if (src) {
            await crawler.addRequests([src]);
          }
        }
      }

      // save url that has no existing entry
      if (
        !prevPaths.includes(pageInfo.path) &&
        !doesURLMatch(reqURL.href, excludeURLPatterns)
      ) {
        if (strictCrawl === true) {
          if (doesURLMatch(reqURL.href, includeURLPatterns)) {
            console.log(`Saving: ${reqURL.href}`);
            await db.push("/urls[]", pageInfo);
          } else {
            console.log(`Skipping: ${reqURL.href}`);
          }
        } else {
          console.log(`Saving: ${reqURL.href}`);
          await db.push("/urls[]", pageInfo);
        }
      } else {
        console.log(`Skipping: ${reqURL.href}`);
      }
    },
  });

  if (strictCrawl === true) {
    console.log("\n*** STRICT CRAWL is ON ***");
    console.log(
      "Only links that matches the include_url_patterns are saved.\n"
    );
  }

  if (useSitemaps === true) {
    const { urls } = await Sitemap.load(sitemapList);
    await crawler.addRequests(urls);
    await crawler.run();
  } else {
    await crawler.run([lastEntry]);
  }
});
