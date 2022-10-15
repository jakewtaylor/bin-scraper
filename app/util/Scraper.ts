import type puppeteer from "puppeteer";
import { parse, compareAsc, formatISO, parseISO } from "date-fns";
import { createBrowser } from "./createBrowser.server";

const config = {
  cookies: {
    cookieNotice1: "#CybotCookiebotDialogBodyButtonDecline",
  },
  postcode: {
    field: "#Postcode",
    submit: 'input[type="submit"][value="Find address"]',
  },
  addressPicker: {
    field: "#UprnAddress",
    options: "#UprnAddress > option",
    submit: 'input[type="submit"][value="Confirm selection"]',
  },
  results: {
    recycling: 'img[alt="Grey wheeled bin"]',
    rubbish: 'img[alt="Green wheeled bin"]',
  },
};

export type BinDay = {
  name: string;
  date: string;
};

class Scraper {
  browser: puppeteer.Browser;
  page: puppeteer.Page;

  constructor(browser: puppeteer.Browser, page: puppeteer.Page) {
    this.browser = browser;
    this.page = page;

    // this.page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  }

  public async scrape(url: string, postcode: string, street: string) {
    await this.page.goto(url);

    await this.enterPostcode(postcode);

    await this.pickAddress(street);

    const results = await this.getResults();

    await this.browser.close();

    return await this.determineNextBinDay(results);
  }

  private async determineNextBinDay(results: BinDay[]) {
    const sorted = results.sort((a, b) =>
      compareAsc(parseISO(a.date), parseISO(b.date))
    );

    return sorted.length ? sorted[0] : null;
  }

  private async enterPostcode(postcode: string) {
    await this.page.type(config.postcode.field, postcode);

    let foundButton = true;

    await this.page.evaluate((selector) => {
      const button = document.querySelector<HTMLInputElement>(selector);

      button?.click();

      if (!button) {
        foundButton = false;
      }
    }, config.postcode.submit);

    if (!foundButton) {
      throw new Error("Couldn't submit postcode form, no button.");
    }

    await this.page.waitForNavigation();
  }

  private async dismissCookieBanner() {
    await this.page.waitForSelector(config.cookies.cookieNotice1);

    await this.page.click(config.cookies.cookieNotice1);

    await this.page.waitForNetworkIdle();
  }

  private async pickAddress(street: string) {
    await this.dismissCookieBanner();

    await this.page.waitForSelector(config.addressPicker.field);

    const options = await this.page.$$eval(
      config.addressPicker.options,
      (elements) =>
        elements.map((op) => ({
          label: op.innerHTML,
          value: op.getAttribute("value"),
        }))
    );

    const option = options.find((op) => op.label.startsWith(street))?.value;

    if (!option)
      throw new Error("Couldn't find an option for the given address!");

    await this.page.select(config.addressPicker.field, option);

    await this.page.click(config.addressPicker.submit);

    await this.page.waitForNetworkIdle();
  }

  private async getResults() {
    let results: BinDay[] = [];

    for (const selector of Object.values(config.results)) {
      const [name, dateString] = await this.page.$eval(selector, (el) => {
        const text = el.parentElement?.parentElement?.textContent?.trim();

        const [name, date] = text?.split("\n").map((s) => s.trim()) ?? [
          null,
          null,
        ];

        return [name, date] as const;
      });

      if (!name || !dateString) continue;

      const date = formatISO(parse(dateString, "EEEE d LLLL yyyy", new Date()));

      results.push({ name, date });
    }

    return results;
  }
}

export const createScraper = async () => {
  const browser = await createBrowser();

  const page = await browser.newPage();

  return new Scraper(browser, page);
};
