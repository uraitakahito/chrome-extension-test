import puppeteer from 'puppeteer';

const EXTENSION_PATH = './src';
// How is the Chrome Extension ID of an unpacked extension generated?
// https://stackoverflow.com/questions/26053434/how-is-the-chrome-extension-id-of-an-unpacked-extension-generated
const EXTENSION_ID = 'jkomgjfbbjocikdmilgaehbfpllalmia';

let browser;

describe('popup.html', () => {
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

  it('renders correctly', async () => {
    expect.assertions(1);

    const page = await browser.newPage();
    await page.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);

    const list = await page.$('ul');
    const children = await list.$$('li');

    expect(children).toHaveLength(1);
  });
});
