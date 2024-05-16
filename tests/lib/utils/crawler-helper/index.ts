import { Page } from "@playwright/test";

async function hasForm(page: Page) {
  const hasForm = await page.evaluate(() => {
    // Check if there's at least one form element on the page
    return document.querySelector("form") !== null;
  });

  return hasForm;
}

async function hasGoogleRecaptcha(page: Page) {
  const hasRecaptcha = await page.evaluate(() => {
    // Check if there's at least one element with a class starting with "g-recaptcha"
    const elements = [...document.querySelectorAll('[class^="g-recaptcha"]')];
    return elements.length > 0;
  });

  return hasRecaptcha;
}

function doesURLMatch(url: string, urlPatterns: string[]): boolean {
  const regexURLPatterns = urlPatterns.map((pattern) => new RegExp(pattern));
  return regexURLPatterns.some((regex) => regex.test(url));
}

export { hasForm, hasGoogleRecaptcha, doesURLMatch };
