import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import JsonDBWrapper from "../tests/lib/db/json_db";
import JSZip from "jszip";
import axios from "axios";
import fs from "fs/promises";

interface SiteConfig {
  production_domain: string;
  staging_domain: string;
  website_name: string;
  username: string;
  password: string;
  sitemap_list: string[];
  exclude_url_patterns: string[];
  include_url_patterns: string[];
  include_images: boolean;
  strict_crawl: boolean;
  crawl_type: string;
}

const app = fastify({ logger: true });
const port = 3000;

// log project directory
const projectDirectory = process.cwd();
const screenshotsDirectory = path.join(projectDirectory, "screenshots");
const sitesDirectory = path.join(projectDirectory, "tests", "sites");
const reportsDirectory = path.join(projectDirectory, "tests", "sites");

const emailDB = new JsonDBWrapper(
  path.join("tests", "lib", "db", "emails.json")
);

app.register(fastifyStatic, {
  root: screenshotsDirectory,
  prefix: "/screenshots/",
});

app.get<{
  Querystring: { siteName: string };
}>("/api/reports", async (request, reply) => {
  try {
    const siteName = request.query?.siteName;
    const reportFile = new JsonDBWrapper(
      path.join(reportsDirectory, siteName, "reports.json")
    );
    const reports = await reportFile.get("/");

    reply.send(reports);
  } catch (error: any) {
    reply.status(500).send(error.message);
  }
});

app.get("/api/sites", async (request, reply) => {
  try {
    const allSites = new JsonDBWrapper(
      path.join("tests", "lib", "db", "all_sites.json")
    );
    const sites = await allSites.get("/sites");

    const siteNames = sites.map((dirent: any) => dirent.website_name);

    reply.send(siteNames);
  } catch (error: any) {
    reply.status(500).send(error.message);
  }
});

app.get<{
  Querystring: { siteName: string };
}>("/api/runs", async (request, reply) => {
  const siteName = request.query?.siteName;
  if (!siteName) {
    return reply.status(400).send("siteName is required");
  }

  try {
    const db = new JsonDBWrapper(
      path.join(sitesDirectory, siteName, "crawled_urls.json")
    );
    const runs = await db.get(`/runs`);

    const runFolders = runs.map((run: any) => run.id);

    reply.send(runFolders);
  } catch (error: any) {
    reply.status(500).send(error.message);
  }
});

app.get<{
  Querystring: { siteName: string; runId: string };
}>("/api/pages", async (request, reply) => {
  const siteName = request.query.siteName;
  const runId = request.query.runId;

  if (!siteName || !runId) {
    return reply.status(400).send("siteName and runId are required");
  }

  try {
    const db = new JsonDBWrapper(
      path.join(sitesDirectory, siteName, "crawled_urls.json")
    );
    const run = await db.db.find(`/runs`, (r: any) => r.id === runId);

    reply.send(run);
  } catch (error: any) {
    reply.status(500).send(error.message);
  }
});

app.get("/api/emails", async (request, reply) => {
  try {
    const emails = await emailDB.get("/emails");
    reply.send(emails);
  } catch (error: any) {
    reply.status(500).send(error.message);
  }
});

app.post("/api/zip-images", async (request, reply) => {
  const { imageURLS }: any = request.body;
  const zip = new JSZip();

  for (const image of imageURLS) {
    const response = await axios({
      method: "get",
      url: image,
      responseType: "stream",
    });

    zip.file(image.split("/").pop(), response.data);
  }

  const zipData = await zip.generateAsync({
    type: "nodebuffer",
    streamFiles: true,
  });

  reply
    .header("Content-Type", "application/octet-stream")
    .header("Content-Disposition", 'attachment; filename="images.zip"')
    .send(zipData);
});

app.post("/sendgrid", async (request, reply) => {
  try {
    const emailData = request.body;
    await emailDB.push("/emails", emailData);
    reply.status(200).send({ message: "email received and stored" });
  } catch (error: any) {
    reply.status(500).send(error.message);
  }
});

app.post<{ Body: SiteConfig }>("/api/add-site", async (request, reply) => {
  const {
    production_domain,
    staging_domain,
    website_name,
    // other fields omitted for brevity
  } = request.body;

  const siteDirectory = path.join(
    process.cwd(),
    "tests",
    "sites",
    website_name
  );
  const sourceDirectory = path.join(process.cwd(), "tests-examples");

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(siteDirectory, { recursive: true });

    // Data for crawl_config.json
    const crawlConfig = JSON.stringify(request.body, null, 2);

    // Data for crawled_urls.json
    const crawledUrls = JSON.stringify(
      {
        production_domain,
        staging_domain,
        urls: [],
        runs: [],
        current_run: "",
      },
      null,
      2
    );

    // Write JSON files
    await fs.writeFile(
      path.join(siteDirectory, "crawl_config.json"),
      crawlConfig
    );
    await fs.writeFile(
      path.join(siteDirectory, "crawled_urls.json"),
      crawledUrls
    );

    // List of files to copy
    const filesToCopy = [
      "compare_screenshots.spec.ts",
      "crawl.spec.ts",
      "screenshots.spec.ts",
    ];

    // Copy files
    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDirectory, file);
      const destinationPath = path.join(siteDirectory, file);
      await fs.copyFile(sourcePath, destinationPath);
    }

    reply.send({
      message: "Site configuration and test files saved successfully!",
    });
  } catch (error) {
    console.error(
      "Failed to save site configuration and copy test files:",
      error
    );
    reply.status(500).send({ error });
  }
});

app.listen(
  {
    port,
  },
  (err, address) => {
    if (err) throw err;
    app.log.info(`Server running at ${address}`);
  }
);
