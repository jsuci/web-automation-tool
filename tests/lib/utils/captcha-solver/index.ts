import { Page } from "playwright-core";
import { Solver } from "2captcha-ts";

const solver = new Solver('c580e60a590dd233437150dda582b5c3');

export async function solveCaptcha(page: Page, dataSitekeySelector: string, submitButtonSelector: string, resultBlockSelector: string, resultBlockInnerText: string) {
  await page.waitForSelector(dataSitekeySelector, {
    timeout: 10000,
  });

  // Extract the `sitekey` parameter from the page.
  const sitekey = await page
    .locator(dataSitekeySelector)
    .getAttribute("data-sitekey");

  if (!sitekey) {
    throw new Error("No sitekey found");
  }

  console.log("sitekey", sitekey);

  // Get actual page url
  const pageurl = await page.url();

  // Submitting the captcha for solution to the service
  const res = await solver.recaptcha({
    pageurl: pageurl,
    googlekey: sitekey || "",
  });

  console.log("res", res);

  // Getting a captcha response including a captcha answer
  const captchaAnswer = res.data;

  await page.evaluate(() => {
    const element = document.querySelector(".g-recaptcha-response");
    if (element) {
      element.style.display = "block"; // or 'inline', 'inline-block', etc.
    }
  });
  await page.locator(".g-recaptcha-response").fill(captchaAnswer);
  console.log("Answer filled");

  // Press the button to check the result.
  await page.click(submitButtonSelector);

  // Check result
  await page.waitForSelector(resultBlockSelector, {
    timeout: 10000
  });

  let statusSolving = await page.locator(resultBlockSelector).innerText() || '';
  console.log('statusSolving', statusSolving);

  if (!statusSolving.includes(resultBlockInnerText)) {
    throw new Error("Captcha not solved");
  }

  return true;
}
