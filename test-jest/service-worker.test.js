// https://developer.chrome.com/docs/extensions/how-to/test/test-serviceworker-termination-with-puppeteer?hl=ja
import puppeteer from 'puppeteer';
import stopServiceWorker from '../src/stopServiceWorker';

const EXTENSION_PATH = './src';
// How is the Chrome Extension ID of an unpacked extension generated?
// https://stackoverflow.com/questions/26053434/how-is-the-chrome-extension-id-of-an-unpacked-extension-generated
const EXTENSION_ID = 'jkomgjfbbjocikdmilgaehbfpllalmia';

let browser;

describe('service worker', () => {
  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: true,
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

  it('can message service worker', async () => {
    expect.assertions(1);

    const page = await browser.newPage();
    await page.goto(`chrome-extension://${EXTENSION_ID}/page.html`);

    // Message without terminating service worker
    await page.click('button');
    await page.waitForSelector('#response-0');

    // Terminate service worker
    await stopServiceWorker(browser, EXTENSION_ID);

    // Try to send another message
    await page.click('button');
    await page.waitForSelector('#response-1');

    const content = await page.content();

    expect(content).toContain('Response 1: 1.3');
  });
});
