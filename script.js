
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

// Define the output directory
const outputDir = path.resolve(__dirname, 'output');

// Check if the output directory exists, if not, create it
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const jsonData = [
  {
    walletAddress: "0x12391231313123132131C",
    imageUrls: [
      "https://i.nfte.ai/ia/l701/148976/539220525048831327_1725804548.avif",
      "https://i.nfte.ai/ia/l701/148976/539220525048831327_1725804548.avif"
    ],
  },
  {
    walletAddress: "0x987zyx654wvu321st",
    imageUrls: [
      "https://i.nfte.ai/ia/l701/148976/539220525048831327_1725804548.avif"
    ],
  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list'
    ]
  });

  for (const item of jsonData) {
    const { walletAddress, imageUrls } = item;

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(imageUrl, { waitUntil: 'networkidle2' });

      const imageBuffer = await page.screenshot();

      // Update the outputPath to include the 'output' directory
      const outputPath = path.join(outputDir, `${walletAddress}_${i}.jpg`);

      await sharp(imageBuffer)
        .toFormat('jpg')
        .toBuffer()
        .then((outputBuffer) => writeFileAsync(outputPath, outputBuffer))
        .catch((err) => console.error('Error converting the image:', err));

      console.log(`Image saved as ${outputPath}`);
      await page.close();
    }
  }

  await browser.close();
})();
