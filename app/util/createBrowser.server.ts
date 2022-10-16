import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// let chrome: any;
// let puppeteer: any;

// if (process.env.NODE_ENV === "production") {
//   chrome = require("chrome-aws-lambda");
//   puppeteer = require("puppeteer-core");
// } else {
//   puppeteer = require("puppeteer");
// }

export const createBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  // return await puppeteer.launch({
  //   args: [
  //     ...(chrome?.args ?? []),
  //     // "--hide-scrollbars",
  //     // "--disable-web-security"
  //   ],
  //   defaultViewport: chrome?.defaultViewport,
  //   executablePath: await chrome?.executablePath,
  //   // ignoreHTTPSErrors: true,
  //   ignoreHTTPSErrors: false,
  //   headless: true,
  //   // headless: false,
  //   // slowMo: 250,
  //   // devtools: true,
  // });
};
