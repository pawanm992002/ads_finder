import puppeteer, { Browser, Page } from "puppeteer";
import { addExtra } from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";

const puppeteerExtra = addExtra(puppeteer);
// puppeteerExtra.use(StealthPlugin());
// puppeteerExtra.use(
//   RecaptchaPlugin({
//     provider: {
//       id: "2captcha",
//       token: "",
//     },
//     visualFeedback: true,
//   })
// );

// function generateRandomProxy(): string {
//   const proxies = [
//     "http://51.158.154.173:3128",
//     "http://51.159.115.233:3128",
//     "http://134.209.29.120:3128",
//     "http://8.219.97.248:80",
//     "http://159.203.61.169:3128",
//     "http://64.225.8.192:9981",
//     "http://188.166.186.35:8282",
//     "http://138.68.60.8:8080",
//     "http://178.62.193.19:3128",
//     "http://128.199.110.230:8080",
//   ];

//   const randomIndex = Math.floor(Math.random() * proxies.length);
//   return proxies[randomIndex];
// }

export class BaseApp {
  private browser!: Browser;
  private page!: Page;

  async init() {
    try {
      this.browser = await puppeteerExtra.launch({
        args: [
          // `--proxy-server=${generateRandomProxy()}`,
          "--disable-dev-shm-usage",
          "--disable-setuid-sandbox",
          "--no-first-run",
          "--no-sandbox",
          "--no-zygote",
          "--deterministic-fetch",
          "--disable-site-isolation-trials",
        ],
        executablePath:
          "/tmp/localChromium/chromium/mac_arm-1449360/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        headless: false,
      });

      this.page = await this.browser.newPage();

      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
    } catch (error) {
      console.log("Error during Puppeteer init:", error);
    }
  }

  public async close() {
    try {
      await this.page.close();
      await this.browser.close();
    } catch (error) {
      console.log("error while closing browser ", error);
    }
  }

  public getPage(): Page {
    return this.page;
  }

  public getBrowser() {
    return this.browser;
  }

  public async delay(t: number) {
    return new Promise<void>(function (resolve) {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }

  public async scrollPage(newPage: Page = this.page) {
    await newPage.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const scrollInterval = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(scrollInterval);
            resolve();
          }
        }, 200);
      });
    });
  }

  public async acceptCookie() {
    const acceptCookiesSelector = '[aria-label="Accept all"]';
    if (await this.page.$(acceptCookiesSelector)) {
      await this.page.click(acceptCookiesSelector);
    }
  }

  public async verifyRecaptcha() {
    try {
      await this.page.waitForSelector('#recaptcha iframe[title="reCAPTCHA"]');
      const iframe = await this.page.$('#recaptcha iframe[title="reCAPTCHA"]');
      const frame = await iframe?.contentFrame();

      if (frame) {
        await frame.waitForSelector("#recaptcha-anchor");
        await frame.click("#recaptcha-anchor");
      }
    } catch (error) {
      console.log("Captcha not found", (error as Error).message);
    }
  }
}
