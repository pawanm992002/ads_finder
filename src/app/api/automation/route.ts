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
    // await page.goto("https://api.ipify.org");

    await page.goto("https://google.com/", { waitUntil: "load" });

    await page.type("textarea", search);
    await page.keyboard.press("Enter");

    await chrome.verifyRecaptcha().catch(() => null);

    for (
      let currentAutomation = 1;
      currentAutomation <= noOfAutomation;
      currentAutomation++
    ) {
      console.log(`Automation: ${currentAutomation}`);
      for (let currentPage = 1; currentPage <= noOfPages; currentPage++) {
        await page.waitForSelector(`.uEierd a`).catch(() => null);

        const ads: string[] = await page.$$eval(".uEierd a", (links) =>
          links.flatMap((el) => (el.href ? [el.href] : []))
        );

        console.log(`Number of Ads on page ${currentPage} are ${ads.length}`);

        for (const [index, link] of ads.entries()) {
          try {
            if (!expectSource || !link?.includes(expectSource)) {
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

        await chrome.delay(3000);

        await page.waitForSelector("a#pnnext");
        await page.$eval("a#pnnext", (el) => el.click());
      }

      await chrome.delay(3000);
      await page.waitForSelector('a[aria-label="Page 1"]').catch(() => null);
      await page.click('a[aria-label="Page 1"]').catch(() => null);
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
