import { NextRequest, NextResponse } from "next/server";
import { BaseApp } from "../../../utility";
import { RequestDataType } from "@/interface/interface";

const chrome = new BaseApp();

const initializePuppeteer = async ({
  noOfAutomation,
  noOfPages,
  search,
  expectSource,
}: RequestDataType) => {
  try {
    await chrome.init();

    const page = chrome.getPage();

    await page.goto("https://google.com/", { waitUntil: "load" });

    await page.type("textarea", search);
    await page.keyboard.press("Enter");

    await chrome.verifyRecaptcha();

    for (
      let currentAutomation = 1;
      currentAutomation <= noOfAutomation;
      currentAutomation++
    ) {
      for (let currentPage = 1; currentPage <= noOfPages; currentPage++) {
        await page.waitForSelector(`.uEierd a`).catch(() => {
          console.log(`No Ads on page: ${currentPage}`);
        });

        const ads: string[] = await page.$$eval(".uEierd a", (links) =>
          links.flatMap((el) => (el.href ? [el.href] : []))
        );

        console.log(`Total Ads Links on page ${currentPage} are ${ads.length}`);

        for (const [index, link] of ads.entries()) {
          try {
            if (expectSource && link?.includes(expectSource)) {
              console.log(`Opening ${index + 1}: ${link}`);

              await chrome.delay(5000);
              const newPage = await page.browser().newPage();
              await chrome.delay(3000);
              await newPage.goto(link, { waitUntil: "load" });
              await chrome.scrollPage(newPage);
              await newPage.close();
            }
          } catch (error) {
            console.error(
              `Error visiting link ${link}:`,
              (error as Error).message
            );
          }
        }

        // await page.waitForFunction(() => window.performance.timing.domComplete);
        await chrome.delay(3000);
        await page.waitForNetworkIdle();

        await page.waitForSelector("a#pnnext");
        await page.click("a#pnnext");
      }
      await page.waitForSelector('a[aria-label="Page 1"]');
      await page.click('a[aria-label="Page 1"]');
    }
    await chrome.close();
  } catch (error) {
    console.log(error);
    await chrome.close();
  }
};

export async function POST(req: NextRequest) {
  console.log("Automation Started: ");
  const { noOfAutomation, noOfPages, search, expectSource }: RequestDataType =
    await req.json();

  console.log("Search Query: ", search);
  console.log("No. of Automation: ", noOfAutomation);
  console.log("No. of Pages: ", noOfPages);
  console.log("Except: ", expectSource);

  await initializePuppeteer({
    noOfAutomation,
    noOfPages,
    search,
    expectSource,
  });
  console.log("Automation Done");

  return NextResponse.json({ done: true });
}

export async function DELETE() {
  await chrome.close();
}
