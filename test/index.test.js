const puppeteer = require("puppeteer");

const EXTENSION_PATH = "./src";
const EXTENSION_ID = "jkomgjfbbjocikdmilgaehbfpllalmia";

let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
});

afterEach(async () => {
  await browser.close();
  browser = undefined;
});

test("popup renders correctly", async () => {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);

  const list = await page.$("ul");
  const children = await list.$$("li");

  expect(children.length).toBe(1);
});
