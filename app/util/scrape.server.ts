import { createScraper } from "./Scraper";

export const scrapeNextBinday = async () => {
  console.log("imma start scraping now");

  const url = process.env.SCRAPE_ADDRESS;
  const postcode = process.env.POSTCODE;
  const street = process.env.STREET;

  if (!url) throw new Error("No URL configured!");
  if (!postcode) throw new Error("No postcode configured!");
  if (!street) throw new Error("No street configured!");

  const scraper = await createScraper();

  return scraper.scrape(url, postcode, street);
};
