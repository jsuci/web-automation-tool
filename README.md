# WP QA Playwright Tool

This project uses Playwright, a Node.js library to automate Chromium, Firefox and WebKit with a single API. Playwright is built to enable cross-browser web automation that is ever-green, capable, reliable and fast.

## Installation

Before you can run the tests, you need to install the necessary packages. You can do this by running the following command in your terminal:

1. Got to the root directory of the project and install dependencies
   ```sh
   npm install
   ```
2. Install browser binaries
   ```sh
   npx playwright install --with-deps
   ```
3. Got to the react-web-ui folder and install dependencies
   ```sh
   cd react-web-ui/
   npm install
   ```
4. To perform the test suites without using CLI, you can install the Playwright extension on VSCode
   ![playwright extension](https://i.imgur.com/Z7MTbaZ.png)

5. After installing the extension, a beaker icon will apear on the side panel, click it
   ![playwright icon](https://imgur.com/8R20RTC.png)

6. A list of sites would appear. Expand a site and see the tests suites available. Click `Run Test` to start
   ![playwright test suites](https://imgur.com/Ehdnc7x.png)

7. Playwright also supports running tests in UI mode via CLI.
   ```sh
   npx playwright test --ui
   ```
   For more information, refer to the [Playwright UI Mode documentation](https://playwright.dev/docs/test-ui-mode).

## Create `.env` file

Create a `.env` file in the root directory:

```
S3_BUCKET=<s3 bucket name>
AWS_ACCESS_KEY_ID=<your aws access key>
AWS_SECRET_ACCESS_KEY=<your aws secret key>
SENDGRID_API_KEY=<your sendgrid api key>
```

## Start the QA Automation Process

### Run the server and web ui

1. start the server and the web ui
   ```bash
   npm start
   ```
2. On your browser, go to `localhost:5173`.

### Perform a test

1. **Add a new site** - If no site is added yet, you can click on the sidebar of the web UI and click `Add New Site`. Enter the necessary information and click `Submit`. This will create necessary files and folders under the `tests\sites` folder.

2. **Create a unique Run ID** - After adding a new site, run the _start a QA Process_ test in `crawl.spec.ts` so that it will create a new run id in the `crawled_urls.json` file.

3. **Crawl the Domains** - Run the \*start crawler`test in`crawl.spec.ts`to crawl the domains in the`crawl_config.json`and populate the`urls`property in the`crawled_urls.json`.

4. **Take screenshots of Pages** - Run the tests one-by-one in `screenshots.spec.ts`. Wait for the other test to finish to avoid conflicts. For example, wait until _Screenshot: staging_ is done then run _screenshots: prod (before update)_. Also make sure that updates are already pushed to site's production before running _screenshots: prod (after update)_. All screenshots will be save to S3 and the screenshots URL are saved in the `crawled_urls.json` runs[*].screenshots property.

5. **Compare Screenshots** - after taking all the screenshots. You can generate comparisons of staging vs production (before update) and production (after update) vs production (before update). Run _start conparing screenshots_ in `compare_screenshots.spec.ts`. You can check the React frontend for results.

## Project Structure

### Important folders

- `api/`: where the backend/server code goes.
- `react-web-ui/`: where the frontend code goes.
- `tests/`: This directory contains the test files. Each `.spec.ts` file represents a test suite.

### Important files

- `tests/sites/{site-name}/crawl_config.json`: this JSON file should contain the neccessary values below:

  ```
  {
      "production_domain": "<the production domain of the site>",
      "staging_domain": "<the staging domain of the site>",
      "website_name": "<the website name>",
      "website_login": {
          "username": "admin",
          "password": "admin"
      },
      "sitemap_list": [<list of sitemap.xml>],
      "exlcude_url_patterns": [<list of regex patterns ex. "#\.*">],
      "include_url_patterns": [<list of regex patterns ex. "\\.com/blog/">],
      "include_images": <boolean value>,
      "strict_crawl": <boolean value>,
      "crawl_type": <string options: "same-domain", "same-hostname", "all">
  }
  ```

  > **Note:** `website_name` should be the same as the name of the site directory. For example, if the site directory is `tests/sites/instoneco.com/`, `website_name` should be `instoneco.com`.

  **Config Definitions:**

  - `sitemap_list` - list of sitemaps to use for crawling
  - `exlcude_url_patterns` - if any of the regex strings matches the url then it is not save to crawled_urls.json
  - `include_url_patterns` - if any of the regex strings matches the url then it is save to crawled_urls.json
  - `include_images` - set true if user wants to crawl image links default is false
  - `use_sitemaps` - set to false if user decides not to use sitemap
  - `strict_crawl` - if true, only urls that match the include_url_patterns are saved to crawled_urls.json
  - `crawl_type` - "same-hostname" - matches any urls that have the same hostname. "same-domain" - matches urls have same domain ex. http://blog.site.com/. "all" - matches any urls found

- `tests/sites/{site-name}/crawled_urls.json`: This JSON files will contain the URLs crawled and Runs created:

  ```json
  {
    "production_domain": "https://instoneco.com",
    "staging_domain": "https://instonestaging.wpengine.com",
    "urls": [],
    "runs": [],
    "current_run": "run_instoneco.com_20240322_210701_c4ae"
  }
  ```

  > **Note:**`urls` will be populated after successfully running _start crawler_ test in crawl.spec.ts. `runs` will be populated after successfully running _start a QA Process_ test in `crawl.spec.ts`.

## Screenshots

1. Home Page
   ![homepage](https://imgur.com/6fLuydr.png)

2. Add New Site Page
   ![add new site](https://imgur.com/HsMPwLC.png)

3. Screenshots Page
   ![screenshot page](https://imgur.com/QuW0p9F.png)
