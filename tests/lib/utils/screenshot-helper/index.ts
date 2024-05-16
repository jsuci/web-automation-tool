import type { Page } from "playwright";
import { PNG } from "pngjs";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import axios from "axios";
import S3 from "../../s3";

export async function fetchImageData(url: string): Promise<Buffer> {
  const MAX_RETRIES = 3; // Maximum number of retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 10000, // Set timeout to 10 seconds
      });
      return Buffer.from(response.data, "binary");
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.warn(
          `Attempt ${attempt}: Connection reset by peer, retrying...`
        );
        continue;
      }
      console.error("Error fetching image data:", error);
      throw error;
    }
  }
  throw new Error("Max retries reached, failing request");
}

export async function compareSaveImages(
  imgBuff1: Buffer,
  imgBuff2: Buffer,
  s3Key: string
): Promise<[number, string]> {
  const s3 = new S3();

  // Load images using sharp and get their metadata for height comparison
  const img1Metadata = await sharp(imgBuff1).metadata();
  const img2Metadata = await sharp(imgBuff2).metadata();

  if (!img1Metadata.height || !img2Metadata.height) {
    throw new Error("Could not retrieve image heights.");
  }

  if (!img1Metadata.width || !img2Metadata.width) {
    throw new Error("Could not retrieve image widths.");
  }

  // Determine which image is shorter, or if they're the same height
  const shorterImageHeight = Math.min(img1Metadata.height, img2Metadata.height);
  const shorterImageWidth = Math.min(img1Metadata.width, img2Metadata.width);

  let img1ResizeBuffer, img2ResizeBuffer;

  if (
    img1Metadata.height === shorterImageHeight &&
    img1Metadata.width === shorterImageWidth
  ) {
    // If img1 is the shorter one, crop img2 to match img1's dimensions
    img1ResizeBuffer = imgBuff1; // No need to crop img1
    img2ResizeBuffer = await sharp(imgBuff2)
      .resize({
        width: shorterImageWidth,
        height: shorterImageHeight,
        fit: "cover",
        position: "left top",
      })
      .toBuffer();
  } else {
    // If img2 is the shorter one, crop img1 to match img2's dimensions
    img1ResizeBuffer = await sharp(imgBuff1)
      .resize({
        width: shorterImageWidth,
        height: shorterImageHeight,
        fit: "cover",
        position: "left top",
      })
      .toBuffer();
    img2ResizeBuffer = imgBuff2; // No need to crop img2
  }

  const img1 = PNG.sync.read(img1ResizeBuffer);
  const img2 = PNG.sync.read(img2ResizeBuffer);

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  // Use pixelmatch to compare the resized/cropped images
  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.3,
      includeAA: true,
      diffColorAlt: [52, 64, 235],
      alpha: 0.3,
    }
  );

  // Write the diff image
  // fs.writeFileSync(diffPath, PNG.sync.write(diff));

  await s3.putObject(s3Key, PNG.sync.write(diff), "image/png");
  const s3ObjectUrl = s3.getObjectUrl(s3Key);

  return [numDiffPixels, s3ObjectUrl]; // Return the number of differing pixels
}

export async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export async function scrollToTop(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const distance = 100;
      const timer = setInterval(() => {
        const scrollPosition = window.scrollY;
        window.scrollBy(0, -distance);

        if (scrollPosition <= 0) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export async function hideIframes(page: Page) {
  const scriptJsContent = `

  const iframes = document.querySelectorAll('iframe');

  iframes.forEach((iframe) => {
    const iframeStyle = window.getComputedStyle(iframe);
  
    const iframeWidth = parseFloat(iframeStyle.width);
    const iframeHeight = parseFloat(iframeStyle.height);

    if (iframeWidth > 0 && iframeHeight > 0) {

      const wrapperDiv = document.createElement('div');

      wrapperDiv.style.width = iframeStyle.width;
      wrapperDiv.style.height = iframeStyle.height;
      
      wrapperDiv.style.border = '1px solid red';
      wrapperDiv.style.boxSizing = 'border-box';
      wrapperDiv.style.display = 'flex';
      wrapperDiv.style.alignItems = 'center';
      wrapperDiv.style.justifyContent = 'center';
  
      const hiddenDiv = document.createElement('div');
      hiddenDiv.textContent = 'iframe hidden';
      hiddenDiv.style.fontWeight = 'bold';
      hiddenDiv.style.color = 'red';
      wrapperDiv.appendChild(hiddenDiv);
  
      iframe.parentNode.insertBefore(wrapperDiv, iframe);
      iframe.parentNode.removeChild(iframe);
    }
  });
  
`;

  await page.addScriptTag({ content: scriptJsContent });
}

export async function processNextURLS(recentItem: string, items: any[]) {
  const selectedIndex = items.findIndex((item) => item.url === recentItem);
  const slicedItems =
    selectedIndex !== -1 ? items.slice(selectedIndex) : items.slice(0);

  return slicedItems;
}
