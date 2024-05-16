import {
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

class SiteReporter implements Reporter {
  private report: any = {};
  private siteName: string = "";
  private testFile: string = "";

  onBegin(config: any, suite: Suite) {
    // Assume the suite file is within the site folder and derive the site name

    this.report = {
      totalTest: 0,
      failedTest: 0,
      passedTest: 0,
      skippedTest: 0,
      errors: [],
    };
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.siteName = path.basename(path.dirname(test.location.file));
    this.testFile = test.location.file;
    this.report.totalTest++;
    if (result.status === "failed") {
      this.report.failedTest++;
      this.report.errors.push({
        testName: test.title,
        location: {
          file: test.location?.file || "",
          column: test.location?.column || 0,
          line: test.location?.line || 0,
        },
        message: result.error?.message,
      });
    } else if (result.status === "passed") {
      this.report.passedTest++;
    } else if (result.status === "skipped") {
      this.report.skippedTest++;
    }
  }

  async onEnd() {
    if (this.testFile.includes("interactivity_tests.spec.ts")) {
      const filename = `reports.json`;
      const dirPath = path.join("tests", "sites", this.siteName);
      const filePath = path.join(dirPath, filename);
      // Write the JSON report to the site folder
      fs.writeFileSync(filePath, JSON.stringify(this.report, null, 2));
    }
  }
}

export default SiteReporter;
