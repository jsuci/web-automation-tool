import { test, expect } from "@playwright/test";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
  pollForEmail,
  sendMail,
  deleteMail,
} from "../../lib/utils/email-helper";

test.describe.skip("Instone Homepage", () => {
  test("Get To Know Us Button", async () => {
    // page init
    const url = "https://instoneco.com/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // action
    await page.locator(".n2-ss-layer.n2-ow").click();

    // test
    expect.soft(page.url()).toBe("https://instoneco.com/about/");
  });

  test("Let’s Get Started Button", async () => {
    const url = "https://instoneco.com/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    await page.locator("a", { hasText: "Let’s Get Started" }).click();

    expect
      .soft(page.url())
      .toBe("https://instoneco.com/let-us-help-you-create-your-next-project/");
  });

  test("Are You A Home Owner Card", async () => {
    const url = "https://instoneco.com/";

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
    });

    const button = await page.locator(
      "a[href='https://instoneco.com/homeowners/']"
    );
    await button.click();
    await page.waitForTimeout(1000);

    expect.soft(page.url()).toBe("https://instoneco.com/homeowners/");
    expect
      .soft(await page.getByRole("heading", { name: "Homeowners" }).innerText())
      .toBe("Homeowners");
  });

  test("Are You A Professional Card", async () => {
    const url = "https://instoneco.com/";

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
    });

    const button = await page
      .locator("div:nth-child(2) > .wp-block-image > a")
      .first();
    await button.click();
    await page.waitForTimeout(1000);

    expect.soft(page.url()).toBe("https://instoneco.com/professionals/");
  });

  test("Category Cards", async () => {
    // page init
    const url = "https://instoneco.com/";
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const expectedCategoryCards = [
      "Artepiso",
      "aura",
      "beon-stone",
      "cultured-stone",
      "dutch-quality",
      "interloc",
      "isokern-fireplaces",
      "pangaea-natural-stone",
    ];

    const catCards = await page.locator(`a.custom-link.no-lightbox`).all();

    for (const catCard of catCards) {
      const catCardLink = await catCard.getAttribute("href");

      const catCardFound = expectedCategoryCards.filter((item) => {
        if (catCardLink) {
          return catCardLink.includes(item);
        }
      });

      expect.soft(catCardFound.length !== 0).toBeTruthy();
    }
  });
});

test.describe.skip("Instone Blog", () => {
  test("Blog Topics Filter ", async () => {
    // page init
    const url = "https://instoneco.com/blog/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // action
    await page.locator(`.facetwp-checkbox[data-value="aura"]`).click();
    await page.locator(`.facetwp-checkbox[data-value="curb-appeal"]`).click();

    // test
    expect
      .soft(page.url())
      .toBe("https://instoneco.com/blog/?_categories=aura%2Ccurb-appeal");
  });

  test("Blog Grid", async () => {
    // page init
    const url = "https://instoneco.com/blog/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // action
    const popupPromise = page.waitForEvent("popup");
    const gridLink = await page
      .locator(`.fwpl-result.r2 a`)
      .first()
      .getAttribute("href");
    await page.locator(`.fwpl-result.r2 a`).first().click();
    const popup = await popupPromise;

    // // test
    expect.soft(popup.url()).toBe(gridLink);
  });

  test("Pagination", async () => {
    // page init
    const url = "https://instoneco.com/blog/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // test next/prev button
    await page.locator(`.facetwp-page.next`).click();
    expect.soft(page.url()).toBe("https://instoneco.com/blog/?_paged=2");

    await page.locator(`.facetwp-page.prev`).click();
    expect.soft(page.url()).toBe("https://instoneco.com/blog/");

    // test clicking a number
    await page.locator(`.facetwp-page[data-page="3"]`).first().click();
    expect.soft(page.url()).toBe("https://instoneco.com/blog/?_paged=3");
  });
});

test.describe.skip("Trade Resources (Instone Army)", () => {
  test("Input Form - Test Invalid Input", async () => {
    // page init
    const url = "https://instoneco.com/instone-army/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // check for invalid email
    await page.getByLabel("First").fill("John_TEST");
    await page.getByLabel("Last").fill("Doe_TEST");
    await page.getByLabel("Email").fill("12222222");

    await page.locator(`input[value="Submit"]`).click();

    await page.waitForLoadState();

    expect.soft(
      page.locator("div", {
        hasText:
          "The email address entered is invalid, please check the formatting (e.g. email@domain.com).",
      })
    ).toBeVisible;
  });

  test("Input Form - Test Form Submit", async () => {
    // page init
    const url = "https://instoneco.com/instone-army/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // check for invalid email
    await page.getByLabel("First").fill("John_TEST");
    await page.getByLabel("Last").fill("Doe_TEST");
    await page.getByLabel("Email").fill("john_doe_TEST@gmail.com");
    await page.getByLabel("Phone").fill("+16469804741");
    await page.getByLabel("Got A Blog Idea?").fill("TEST idea");
    await page
      .locator(
        `input[value="Social Media Support - I'd like to get premade social media posts for my business."]`
      )
      .check();

    await page.locator(`input[value="Submit"]`).click();

    await page.waitForLoadState();

    expect.soft(
      page.locator("div", {
        hasText:
          "Thanks for contacting us! We will get in touch with you shortly.",
      })
    ).toBeVisible;
  });

  test("Instagram Feed", async () => {
    // page init
    const url = "https://instoneco.com/instone-army/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const firstIgBox = page.locator(".sbi_link_area.nofancybox").first();
    const firstIgBoxLink = await firstIgBox.getAttribute("href");

    await firstIgBox.click();

    await page.locator(`img.sbi_lb-image[src="${firstIgBoxLink}"]`).waitFor();

    const imageBox = page.locator(`img.sbi_lb-image[src="${firstIgBoxLink}"]`);

    expect.soft(await imageBox.isVisible()).toBeTruthy();
  });

  test("Blog - Blog Clicked", async () => {
    // page init
    const url = "https://instoneco.com/instone-army/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // action
    const firstBlog = page
      .locator(".alignwide.wp-block-post-featured-image > a")
      .first();

    const firstBlogLink = await firstBlog.getAttribute("href");

    await firstBlog.click();

    await page.waitForLoadState();

    // test
    expect.soft(page.url()).toBe(firstBlogLink);
  });

  test("Blog - Read More Clicked", async () => {
    // page init
    const url = "https://instoneco.com/instone-army/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // action
    const readMore = page.locator("a", { hasText: "Read More" }).first();
    const readMoreLink = await readMore.getAttribute("href");

    await readMore.click();

    await page.waitForLoadState();

    // test
    expect.soft(page.url()).toBe(readMoreLink);
  });

  test("Horizontal Gallery", async () => {
    // page init
    const url = "https://instoneco.com/instone-army/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // action
    const firstGalleryImage = page
      .locator(".wp-block-image.size-venture-featured-image img")
      .first();
    const firstGalleryImageLink = await firstGalleryImage.getAttribute("src");

    await firstGalleryImage.click();

    const imagePopUp = page.locator(
      `.coblocks-lightbox__image > img[src="${firstGalleryImageLink}"]`
    );

    await imagePopUp.waitFor();

    expect.soft(await imagePopUp.isVisible()).toBeTruthy();
  });
});

test.describe.skip("Trade Resources(Fabrication & Design Services) ", () => {
  test("On-Page Navigation", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // check for invalid email
    const fireplaceNav = page.locator("#mega-menu-primary > li > a", {
      hasText: "Fireplaces",
    });

    const fireplaceNavLink = await fireplaceNav.getAttribute("href");

    await fireplaceNav.click();

    await page.waitForLoadState();

    expect.soft(page.url()).toBe(fireplaceNavLink);
  });

  test("Input Form - Test Invalid Input", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // check for invalid email

    const formFrame = page.frameLocator(".hs-form-iframe");

    await formFrame.getByLabel("First name").fill("");
    expect.soft(
      formFrame.locator("label", {
        hasText: "Please complete this required field.",
      })
    ).toBeVisible;

    await formFrame.getByLabel("Last name").fill("Doe_TEST");
    await formFrame.getByLabel("Email").fill("12222222");
    expect.soft(
      formFrame.locator("label", {
        hasText: "Email must be formatted correctly.",
      })
    ).toBeVisible;

    await formFrame.getByLabel("State/Region").fill("Pennsylvania");
    await formFrame
      .locator(`textarea[name="comments"]`)
      .fill("project_details_TEST");
  });

  test("Input Form - Test Form Submission", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    // check for invalid email

    const formFrame = page.frameLocator(".hs-form-iframe");
    await formFrame.getByLabel("First name").fill("John_TEST");
    await formFrame.getByLabel("Last name").fill("Doe_TEST");
    await formFrame.getByLabel("Email").fill("john_doe_TEST@gmail.com");
    await formFrame.getByLabel("State/Region").fill("Pennsylvania_TEST");
    await formFrame
      .locator(`textarea[name="comments"]`)
      .fill("project_details_TEST");

    await formFrame.locator(`input[type="submit"]`).click();

    expect
      .soft(
        formFrame
          .locator("div", { hasText: "Thanks for submitting the form." })
          .nth(1)
      )
      .toContainText("Thanks for submitting the form.");
  });

  test("Today Button", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const todayButton = page.locator(
      `a[href="https://landing.instoneco.com/instone-fabrication-and-design-services-contact-us"]`
    );

    const todayButtonLink = await todayButton.getAttribute("href");

    await todayButton.click();

    expect.soft(page.url()).toBe(todayButtonLink);
  });

  test("Available Materials Gallery", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const slider = page
      .locator(".elementor-image-carousel.swiper-wrapper")
      .nth(1);

    const firstImage = slider.locator(".swiper-slide").first();
    const firstImageClass = await firstImage.getAttribute("class");

    await page.waitForTimeout(2000);

    const firstNewImage = slider.locator(".swiper-slide").first();
    const firstImageNewClass = await firstNewImage.getAttribute("class");

    expect.soft(firstImageClass !== firstImageNewClass).toBeTruthy;
  });

  test("Catalog", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const formFrame = page.frame({
      url: "https://player.flipsnack.com?hash=QjY5RkY2NjZBRUQrN3BtYXBodWJkYw==",
    });

    if (formFrame) {
      await formFrame.locator("#btn-next").click();
      expect.soft(formFrame.locator("#btn-previous")).toBeAttached();
    }
  });

  test("Resources Cards", async () => {
    // page init
    const url =
      "https://instoneco.com/instones-fabrication-and-design-services/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const gridItems = await page
      .locator(`.elementor-post.elementor-grid-item`)
      .all();

    for (const grid of gridItems) {
      const gridAtag = grid.locator("a.elementor-post__thumbnail__link");
      const gridLink = await gridAtag.getAttribute("href");

      await grid.click();

      await page.waitForLoadState();

      expect.soft(page.url()).toBe(gridLink);

      await page.goto(url, {
        waitUntil: "load",
      });
    }
  });
});

test.describe.skip("Trade Resources (Masonry Blade)", () => {
  test("Shop for Blade & Tools Button", async () => {
    // page init
    const url = "https://instoneco.com/masonry-saw-blades/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const popupPromise = page.waitForEvent("popup");

    const bladeToolsBtn = page.locator("a", {
      hasText: "Shop for Blades & Tools",
    });

    const bladeToolsBtnLink = await bladeToolsBtn.getAttribute("href");

    await bladeToolsBtn.click();

    const popup = await popupPromise;

    await popup.waitForLoadState("domcontentloaded");

    expect.soft(popup.url()).toBe(bladeToolsBtnLink);
  });

  test("Saw Blade Chart Link Button", async () => {
    // page init
    const url = "https://instoneco.com/masonry-saw-blades/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const popupPromise = page.waitForEvent("popup");

    const sawBladeChart = page.locator("a", {
      hasText: "saw blade chart",
    });

    await sawBladeChart.click();

    const popup = await popupPromise;

    await popup.waitForLoadState("domcontentloaded");

    expect
      .soft(popup.url())
      .toBe(
        "https://www.virginiaabrasives.com/flooring-resources/?p=ideal-uses-for-diamond-abrasives"
      );
  });
});

test.describe.skip("Trade Resources (Tech Guides & Training Videos)", () => {
  test("3 Training / Guides Card", async () => {
    // page init
    const url = "https://instoneco.com/professionals/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const firsFigure = page
      .locator("figure.wp-block-gallery.has-nested-images")
      .first();
    const blockFigures = await firsFigure.locator("figure").all();

    for (const blockFigure of blockFigures) {
      const blockImageLink = await blockFigure
        .locator("a")
        .getAttribute("href");

      try {
        const popupPromise = page.waitForEvent("popup");
        await blockFigure.click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        expect.soft(popup.url()).toBe(blockImageLink);
      } catch (e) {
        await page.waitForLoadState();
        expect.soft(page.url()).toBe(blockImageLink);
      }

      await page.goto(url, {
        waitUntil: "load",
      });
    }
  });

  test("Catalog and Brochures Section", async () => {
    // page init
    const url = "https://instoneco.com/professionals/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const formFrame = page.frameLocator("#ProfessionalsCatalogDrawer");
    const firstFlipCard = formFrame
      .locator(".FlipbookCardstyles__ImageContainer-sc-12bnrjt-0 > img")
      .first();

    await firstFlipCard.dispatchEvent("click");
    await firstFlipCard.click({ force: true });

    await formFrame.getByLabel(`Logo image`).waitFor();

    expect.soft(formFrame.getByLabel(`Logo image`)).toBeVisible();
  });

  test("Find Guides Button", async () => {
    // page init
    const url = "https://instoneco.com/professionals/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const fintGuideBtn = page.locator("a", { hasText: "Find Guides" });
    await fintGuideBtn.click();

    expect
      .soft(page.url())
      .toBe("https://instoneco.com/technical-installation-guides/");
  });

  test("Watch Videos Button - Get MSV Certified", async () => {
    // page init
    const url = "https://instoneco.com/professionals/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const popupPromise = page.waitForEvent("popup");

    const watchVideos = page.locator("a", { hasText: "Watch Videos" });
    await watchVideos.click();
    const popupFirst = await popupPromise;
    expect
      .soft(popupFirst.url())
      .toBe("https://instoneco.com/instone-educational-videos-2/");

    await page.goto(url, {
      waitUntil: "load",
    });

    const getMSVCert = page.locator("a", { hasText: "Get MSV Certified" });
    await getMSVCert.click();
    const popupSecond = await popupPromise;
    expect
      .soft(popupSecond.url())
      .toBe("https://instoneco.com/instone-educational-videos-2/");
  });

  test("Product Cards", async () => {
    // page init
    const url = "https://instoneco.com/professionals/";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const secondFigure = page
      .locator("figure.wp-block-gallery.has-nested-images")
      .nth(1);
    const blockFigures = await secondFigure.locator("figure").all();

    for (const blockFigure of blockFigures) {
      const blockLink = await blockFigure
        .locator("a.custom-link.no-lightbox")
        .getAttribute("href");

      try {
        const popupPromise = page.waitForEvent("popup");
        await blockFigure.click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        expect.soft(popup.url()).toBe(blockLink);
      } catch (e) {
        await page.waitForLoadState();
        expect.soft(page.url()).toBe(blockLink);
      }
      await page.goto(url, {
        waitUntil: "load",
      });
    }
  });
});

test.describe.skip("Category Pages", () => {
  test("Gallery Slider", async () => {
    // page init
    const urls = [
      "https://instoneco.com/Artepiso",
      "https://instoneco.com/aura",
      "https://instoneco.com/beon-stone",
      "https://instoneco.com/cultured-stone",
      "https://instoneco.com/dutch-quality",
      "https://instoneco.com/interloc",
      "https://instoneco.com/isokern-fireplaces",
      "https://instoneco.com/pangaea-natural-stone",
    ];
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const refStyleClass = /translate3d\(0px, 0px, 0px\)/;
    const refModalClass = /display: none;/;

    for (const url of urls) {
      await page.goto(url, {
        waitUntil: "load",
      });

      // drag action
      await page
        .locator(".sbi-owl-item:nth-child(1)")
        .dragTo(page.locator(".sbi-owl-item:nth-child(3)"));

      const afterDragStyle = await page
        .locator("div[role='carousel'] .sbi-owl-stage")
        .getAttribute("style");

      expect.soft(refStyleClass.test(afterDragStyle ?? "")).toBeTruthy;

      await page.reload();

      // click nav action
      const prevNav = page.locator(".sbi-owl-prev");
      const nextNav = page.locator(".sbi-owl-next");

      await nextNav.click();
      const afterNextNavClickStyle = await page
        .locator("div[role='carousel'] .sbi-owl-stage")
        .getAttribute("style");
      expect.soft(!refStyleClass.test(afterNextNavClickStyle ?? "")).toBeTruthy;

      await prevNav.click();
      const afterPrevNavClickStyle = await page
        .locator("div[role='carousel'] .sbi-owl-stage")
        .getAttribute("style");
      expect.soft(refStyleClass.test(afterPrevNavClickStyle ?? "")).toBeTruthy;

      // click item action
      const firstBox = page.locator(`.sbi_link_area.nofancybox`).first();

      await firstBox.click();

      const modalClass = await page
        .locator(".sbi_lightboxOverlay")
        .getAttribute("style");
      // check if modal is not hidden
      expect.soft(!refModalClass.test(modalClass ?? "")).toBeTruthy();
    }
  });

  test("Show Now Button", async () => {
    // page init
    const urls = [
      "https://instoneco.com/Artepiso",
      "https://instoneco.com/aura",
      "https://instoneco.com/beon-stone",
      "https://instoneco.com/cultured-stone",
      "https://instoneco.com/dutch-quality",
      "https://instoneco.com/interloc",
      "https://instoneco.com/isokern-fireplaces",
      "https://instoneco.com/pangaea-natural-stone",
    ];

    const showNowLinks = [
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile",
      "https://portal.instoneco.com/natural-landscape-products",
      "https://portal.instoneco.com/beon_stone",
      "https://portal.instoneco.com/cultured_stone",
      "https://portal.instoneco.com/dutch_quality",
      "https://portal.instoneco.com/interloc-natural-stone-panels",
      "https://portal.instoneco.com/isokern_fireplaces",
      "https://portal.instoneco.com/thin-veneer-products/pangaea-natural-stone",
    ];
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (let i = 0; i < urls.length; i++) {
      await page.goto(urls[i], {
        waitUntil: "load",
      });

      // click nav action
      const showNowBtn = page.locator("a", {
        hasText: "Shop Now",
      });

      await showNowBtn.click();
      await page.waitForLoadState();

      expect.soft(page.url().includes(showNowLinks[i])).toBeTruthy();
    }
  });

  test("Portfolio Card", async () => {
    // page init
    const urls = [
      "https://instoneco.com/Artepiso",
      "https://instoneco.com/aura",
      "https://instoneco.com/beon-stone",
      "https://instoneco.com/cultured-stone",
      "https://instoneco.com/dutch-quality",
      "https://instoneco.com/interloc",
      "https://instoneco.com/isokern-fireplaces",
      "https://instoneco.com/pangaea-natural-stone",
    ];

    const portfolioCardLinks = [
      "https://instoneco.com/portfolio/artepiso/",
      "https://instoneco.com/portfolio/aura/",
      "https://instoneco.com/portfolio/be-on-stone/",
      "https://instoneco.com/portfolio/cultured-stone/",
      "https://instoneco.com/portfolio/dutch-quality/",
      "https://instoneco.com/portfolio/interloc/",
      "https://instoneco.com/portfolio/isokern/",
      "https://instoneco.com/portfolio/pangaea/",
    ];
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (let i = 0; i < urls.length; i++) {
      await page.goto(urls[i], {
        waitUntil: "load",
      });

      // click nav action
      const portfolioCard = page.locator("a.vp-portfolio__item-meta");
      const popupPromise = page.waitForEvent("popup");

      await portfolioCard.click();
      await page.waitForLoadState();
      const popup = await popupPromise;

      await expect
        .soft(popup.url().includes(portfolioCardLinks[i]))
        .toBeTruthy();
    }
  });

  test("Blog Cards", async () => {
    // page init
    const urls = [
      "https://instoneco.com/Artepiso",
      "https://instoneco.com/aura",
      "https://instoneco.com/beon-stone",
      "https://instoneco.com/cultured-stone",
      "https://instoneco.com/dutch-quality",
      "https://instoneco.com/interloc",
      "https://instoneco.com/isokern-fireplaces",
      "https://instoneco.com/pangaea-natural-stone",
    ];

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const url of urls) {
      await page.goto(url, {
        waitUntil: "load",
      });

      const blogCards = await page.locator("ul.columns-3 > li").all();

      for (const blog of blogCards) {
        const blogCardLink = await blog
          .locator("figure.alignwide a")
          .getAttribute("href");

        await blog.click();

        await page.waitForLoadState();

        expect.soft(page.url()).toBe(blogCardLink);

        await page.goto(url, {
          waitUntil: "load",
        });
      }
    }
  });

  test("Read More", async () => {
    // page init
    const urls = [
      "https://instoneco.com/Artepiso",
      "https://instoneco.com/aura",
      "https://instoneco.com/beon-stone",
      "https://instoneco.com/cultured-stone",
      "https://instoneco.com/dutch-quality",
      "https://instoneco.com/interloc",
      "https://instoneco.com/isokern-fireplaces",
      "https://instoneco.com/pangaea-natural-stone",
    ];

    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const url of urls) {
      await page.goto(url, {
        waitUntil: "load",
      });

      const blogCards = await page.locator("ul.columns-3 > li").all();

      for (const blog of blogCards) {
        const readMore = blog.locator("a", {
          hasText: "Read more",
        });

        const readMoreLink = await readMore.getAttribute("href");

        await readMore.click();

        await page.waitForLoadState();

        expect.soft(page.url()).toBe(readMoreLink);

        await page.goto(url, {
          waitUntil: "load",
        });
      }
    }
  });
});

test.describe.skip("Check Stock (Main Page)", () => {
  test("Hero Slider", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/?_gl=1*k7xx7c*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzQ3OTUyNS40Ny4xLjE3MDc0ODEzNTguNDkuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const slider = page.locator(".home-slide-show__wrap");
    const prevSliderBtn = slider.locator(`a[data-slide="prev"]`);
    const nextSliderBtn = slider.locator(`a[data-slide="next"]`);

    const getActiveItemIndex = async () => {
      return page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll(".home-slide-show__wrap .item")
        );
        const activeItem = document.querySelector(
          ".home-slide-show__wrap .item.active"
        );
        if (activeItem) {
          return items.indexOf(activeItem);
        } else {
          return 0;
        }
      });
    };

    // next btn click
    await nextSliderBtn.click();
    await page
      .locator(".home-slide-show__wrap .item.active.left")
      .waitFor({ state: "hidden" });
    const nextIndex = await getActiveItemIndex();

    await page.waitForTimeout(2000);

    // prev btn click
    await prevSliderBtn.click();
    await page
      .locator(".home-slide-show__wrap .item.active.right")
      .waitFor({ state: "hidden" });
    const prevIndex = await getActiveItemIndex();

    expect.soft(nextIndex !== prevIndex).toBeTruthy();
  });

  test("Learn More and See Product", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/?_gl=1*k7xx7c*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzQ3OTUyNS40Ny4xLjE3MDc0ODEzNTguNDkuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const slider = page.locator(".home-slide-show__wrap");

    // learn more check
    const expectedLearnMoreLink = `https://portal.instoneco.com/content/aboutus.asp`;
    const learnMoreLink = await slider
      .locator("a", { hasText: "Learn More" })
      .getAttribute("href");

    expect
      .soft(expectedLearnMoreLink.includes(learnMoreLink ?? ""))
      .toBeTruthy();

    // see product selection
    const seeProducts = await slider
      .locator("a", {
        hasText: "See Product Selection",
      })
      .all();

    const expectedSeeMoreLinks = [
      "https://portal.instoneco.com/interloc-natural-stone-panels",
      "https://portal.instoneco.com/natural-landscape-products",
      "https://portal.instoneco.com/thin_veneer/pangaea_natural_stone",
      "https://portal.instoneco.com/isokern_fireplaces",
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile",
      "https://portal.instoneco.com/cultured_stone/",
      "https://portal.instoneco.com/beon_stone/",
      "https://portal.instoneco.com/dutch_quality",
    ];

    for (const seeProd of seeProducts) {
      const seeMoreLink = await seeProd.getAttribute("href");
      const seeMoreFound = expectedSeeMoreLinks.filter((item) => {
        if (seeMoreLink) {
          return item.includes(seeMoreLink);
        }
      });

      expect.soft(seeMoreFound.length !== 0).toBeTruthy();
    }
  });

  test("Product Cards", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/?_gl=1*k7xx7c*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzQ3OTUyNS40Ny4xLjE3MDc0ODEzNTguNDkuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const expectedProdCardLinks = [
      "https://portal.instoneco.com/thin-veneer-products",
      "https://portal.instoneco.com/natural-landscape-products/",
      "https://portal.instoneco.com/moisture_management/",
      "https://portal.instoneco.com/beon_stone/",
      "https://portal.instoneco.com/glen-gery/",
      "https://portal.instoneco.com/isokern_fireplaces/",
    ];

    const prodCards = await page.locator(".row-fluid a").all();

    for (const prodCard of prodCards) {
      const prodCardLink = await prodCard.getAttribute("href");
      const prodCardFound = expectedProdCardLinks.filter((prodCard) => {
        if (prodCardLink) {
          return prodCard.includes(prodCardLink);
        }
      });

      expect.soft(prodCardFound.length !== 0).toBeTruthy();
    }
  });

  test("Product Section with Slider", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/?_gl=1*k7xx7c*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzQ3OTUyNS40Ny4xLjE3MDc0ODEzNTguNDkuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const getTransformValue = async () => {
      return page.evaluate(() => {
        const element = document.querySelector(".owl-stage-outer .owl-stage");
        if (element instanceof HTMLElement) {
          return element.style.transform;
        }
      });
    };

    const initialTransform = await getTransformValue();

    const prevBtn = page.locator(".owl-prev");
    const nextBtn = page.locator(".owl-next");
    const dotsBtn = page.locator(".owl-dot:not(.active)").first();

    await nextBtn.click();
    const nextTransform = await getTransformValue();
    expect.soft(initialTransform !== nextTransform).toBeTruthy();

    await prevBtn.click();
    const prevTransform = await getTransformValue();
    expect.soft(initialTransform === prevTransform).toBeTruthy();

    await dotsBtn.click();
    const dotsTransform = await getTransformValue();
    expect.soft(nextTransform === dotsTransform).toBeTruthy();
  });
});

test.describe.skip("Check Stock (Artepiso) ", () => {
  test("Dropdown with checkbox", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile/?_gl=1*1kl1jvw*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzE2OTIuMzAuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const brand = page.locator(`a[data-toggle="collapse"]`, {
      hasText: "Brand",
    });
    await brand.click();
    await page
      .locator("a.nys_subtitle.module-header.collapsed", { hasText: "Brand" })
      .waitFor();
    expect
      .soft(await brand.getAttribute("class"))
      .toBe("nys_subtitle module-header  collapsed");

    const availability = page.locator(`a[data-toggle="collapse"]`, {
      hasText: "Availability",
    });
    await availability.click();
    await page
      .locator("a.nys_subtitle.module-header.collapsed", {
        hasText: "Availability",
      })
      .waitFor();
    expect
      .soft(await brand.getAttribute("class"))
      .toBe("nys_subtitle module-header  collapsed");
  });

  test("Sort By", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile/?_gl=1*1kl1jvw*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzE2OTIuMzAuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const sortBy = page.getByLabel("Sort by");
    await sortBy.selectOption("Name (z-a)");

    const firstEntry = page
      .locator("#products_view  #prod_listings .prod-nm a.detail_link")
      .first();
    await firstEntry.waitFor();
    const firstEntryLetter = await firstEntry.textContent();
    if (firstEntryLetter) {
      expect.soft(firstEntryLetter?.charAt(0) < "Z").toBeTruthy();
    }
  });

  test("Quantity Field", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile/?_gl=1*1kl1jvw*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzE2OTIuMzAuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const enterQty = page.locator("input.qty-input.custom-qty").first();
    await enterQty.fill("2");
    await enterQty.press("Enter");

    await page.locator(".sk-three-bounce").first().waitFor({ state: "hidden" });

    const tbd = page.locator("td", { hasText: "TBD" }).first();
    expect.soft((await tbd.textContent()) === "TBD").toBeTruthy();
  });

  test("'Dealer Login' Button", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile/?_gl=1*1kl1jvw*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzE2OTIuMzAuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const dealerLogin = page
      .locator("a.global-modal", { hasText: "Dealer Login" })
      .first();

    await dealerLogin.click();

    await page.locator(".sk-three-bounce").first().waitFor({ state: "hidden" });

    const signInModal = page.locator(".modal-header h3", {
      hasText: "Sign in to Your Account",
    });

    expect.soft(await signInModal.isVisible()).toBeTruthy();
  });

  test("Recently Viewed", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/artepiso_architectural_concrete_tile/?_gl=1*1kl1jvw*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzE2OTIuMzAuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const recentlyViewed = page.locator(".recently-viewed__title", {
      hasText: "Recently Viewed",
    });
    expect.soft(await recentlyViewed.isVisible()).toBeFalsy();
  });
});

test.describe.skip("Check Stock (Be.On)", () => {
  test("Product Category", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/beon_stone/?_gl=1*dknsiz*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzMyMjYuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const expectedProCardLinks = [
      "https://portal.instoneco.com/beon_stone/canyon",
      "https://portal.instoneco.com/beon_stone/classic",
      "https://portal.instoneco.com/beon_stone/element",
      "https://portal.instoneco.com/beon_stone/horizon",
      "https://portal.instoneco.com/beon_stone/accessories",
    ];

    const proCards = await page
      .locator(`.category-listings[data-layout="gallery"] > .prod-card`)
      .all();

    for (const proCard of proCards) {
      const proCardLink = await proCard
        .locator("a")
        .first()
        .getAttribute("href");
      const proCardFound = expectedProCardLinks.filter((item) => {
        if (proCardLink) {
          return item.includes(proCardLink);
        }
      });

      expect.soft(proCardFound.length !== 0).toBeTruthy();
    }
  });

  test("Recently Viewed", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/beon_stone/?_gl=1*dknsiz*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzMyMjYuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const recentlyViewed = page.locator(".recently-viewed__title", {
      hasText: "Recently Viewed",
    });
    expect.soft(await recentlyViewed.isVisible()).toBeFalsy();
  });

  test("Navigation Products", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/beon_stone/?_gl=1*dknsiz*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzMyMjYuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const navProducts = page.locator(".header__prodcat__toggle", {
      hasText: "Products",
    });

    await navProducts.click();

    const firstNavProdItem = page.locator("ul.prodcat.prodcat__ul-1 a", {
      hasText: "What's New!",
    });

    expect.soft(await firstNavProdItem.isVisible()).toBeTruthy();
  });

  test("Navigation Sign In", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/beon_stone/?_gl=1*dknsiz*_gcl_au*MTMwMDE5Mjg3OC4xNzAwMjQ0MTIy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwNzgyNzUxMS40OC4xLjE3MDc4MzMyMjYuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const signInBtn = page.locator(".header__signin-open.global-modal", {
      hasText: "Sign In",
    });

    await signInBtn.click();

    await page.locator(".sk-three-bounce").first().waitFor({ state: "hidden" });

    const signInModal = page.locator(".modal-header h3", {
      hasText: "Sign in to Your Account",
    });

    expect.soft(await signInModal.isVisible()).toBeTruthy();

    // const navProducts = page.locator(".header__prodcat__toggle", {
    //   hasText: "Products",
    // });

    // await navProducts.click();

    // const firstNavProdItem = page.locator("ul.prodcat.prodcat__ul-1 a", {
    //   hasText: "What's New!",
    // });

    // expect.soft(await firstNavProdItem.isVisible()).toBeTruthy();
  });
});

test.describe("Check Stock (Interlock Natural) ", () => {
  test("Facet", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/interloc-natural-stone-panels/?_gl=1*1faf56b*_gcl_au*MTY5NTY3MDQ3NS4xNzA5MDU4MTcy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwOTEzNTQ0Ni41NS4xLjE3MDkxMzY5NDkuNjAu";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const availability = page.locator(`input#input_AvailabilityAvailabl`);
    await availability.check();
    await page.locator(".sk-three-bounce").first().waitFor({ state: "hidden" });
    expect
      .soft(await page.locator("#prod_listings.prod-listings").isVisible())
      .toBeTruthy();
  });

  test("Filter", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/interloc-natural-stone-panels/?_gl=1*1faf56b*_gcl_au*MTY5NTY3MDQ3NS4xNzA5MDU4MTcy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwOTEzNTQ0Ni41NS4xLjE3MDkxMzY5NDkuNjAu";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const sortBy = page.getByLabel("Sort by");
    await sortBy.selectOption("Name (z-a)");

    const firstEntry = page
      .locator("#products_view  #prod_listings .prod-nm a.detail_link")
      .first();
    await firstEntry.waitFor();
    const firstEntryLetter = await firstEntry.textContent();
    if (firstEntryLetter) {
      expect.soft(firstEntryLetter?.charAt(0) < "Z").toBeTruthy();
    }
  });

  test("Quantity Field", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/interloc-natural-stone-panels/?_gl=1*1faf56b*_gcl_au*MTY5NTY3MDQ3NS4xNzA5MDU4MTcy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwOTEzNTQ0Ni41NS4xLjE3MDkxMzY5NDkuNjAu";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const enterQty = page.locator("input.qty-input.custom-qty").first();
    await enterQty.fill("1");
    await enterQty.press("Enter");

    await page.locator(".sk-three-bounce").first().waitFor({ state: "hidden" });
    const tbd = page.locator("td", { hasText: "TBD" }).first();
    expect.soft((await tbd.textContent()) === "TBD").toBeTruthy();
  });
});

test.describe("Check Stock (Moisture Management / Lath)", () => {
  test("Product Category", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/moisture_management/?_gl=1*xwrt9e*_gcl_au*MTY5NTY3MDQ3NS4xNzA5MDU4MTcy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwOTI5MzQxMy41Ni4xLjE3MDkyOTM3MDEuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const expectedProCardLinks = [
      "https://portal.instoneco.com/mortar_deflection_products/",
      "https://portal.instoneco.com/rainscreen_products/",
      "https://portal.instoneco.com/tools/",
      "https://portal.instoneco.com/weather_resistant_barrier/",
      "https://portal.instoneco.com/weep_screeds_drip_edge_products/",
      "https://portal.instoneco.com/lathing_products/",
    ];

    const proCards = await page
      .locator(`.category-listings[data-layout="gallery"] > .prod-card`)
      .all();

    for (const proCard of proCards) {
      const proCardLink = await proCard
        .locator("a")
        .first()
        .getAttribute("href");
      const proCardFound = expectedProCardLinks.filter((item) => {
        if (proCardLink) {
          return item.includes(proCardLink);
        }
      });

      expect.soft(proCardFound.length !== 0).toBeTruthy();
    }
  });

  test("Recently Viewed", async () => {
    // page init
    const url =
      "https://portal.instoneco.com/moisture_management/?_gl=1*xwrt9e*_gcl_au*MTY5NTY3MDQ3NS4xNzA5MDU4MTcy*_ga*MTA2NDYxNzgyNi4xNzAwMjQ0MTIy*_ga_0011ZGYZ67*MTcwOTI5MzQxMy41Ni4xLjE3MDkyOTM3MDEuNTQuMC4w";
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "load",
    });

    const recentlyViewed = page.locator(".recently-viewed__title", {
      hasText: "Recently Viewed",
    });
    expect.soft(await recentlyViewed.isVisible()).toBeFalsy();
  });
});

test.describe.skip("Check Outoging Emails", () => {
  test("Testing customerservice@instoneco.com Email ", async () => {
    await sendMail({
      emailTo: "customerservice@instoneco.com",
      emailFrom: "jam@inboundfound.com",
      subject: "Email Functionality Test - Please Ignore",
      text: "I hope this email reaches you well. I am currently conducting a test to verify the functionality of your email system. Please ignore this message as it is only a test. Thank you for your cooperation.",
      html: "<p>I hope this email reaches you well. I am currently conducting a test to verify the functionality of your email system. Please ignore this message as it is only a test.</p><p>Thank you for your cooperation.</p><p>Best regards,</p>Jam<br>QA Tester<br>InboundFound.com",
    });

    const emailResponse = await pollForEmail({
      eventType: "delivered",
      email: "customerservice@instoneco.com",
    });

    expect.soft(emailResponse.length > 0).toBeTruthy();

    await deleteMail();
  });

  test("Testing webmaster@instoneco.com Email ", async () => {
    await sendMail({
      emailTo: "webmaster@instoneco.com",
      emailFrom: "jam@inboundfound.com",
      subject: "Email Functionality Test - Please Ignore",
      text: "I hope this email reaches you well. I am currently conducting a test to verify the functionality of your email system. Please ignore this message as it is only a test. Thank you for your cooperation.",
      html: "<p>I hope this email reaches you well. I am currently conducting a test to verify the functionality of your email system. Please ignore this message as it is only a test.</p><p>Thank you for your cooperation.</p><p>Best regards,</p>Jam<br>QA Tester<br>InboundFound.com",
    });

    const emailResponse = await pollForEmail({
      eventType: "delivered",
      email: "webmaster@instoneco.com",
    });

    expect.soft(emailResponse.length > 0).toBeTruthy();

    await deleteMail();
  });
});
