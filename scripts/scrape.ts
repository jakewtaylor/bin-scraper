import { scrapeNextBinday } from "../app/util/scrape.server";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { format, parseISO } from "date-fns";

dotenv.config();

scrapeNextBinday().then((res) => {
  if (res) {
    console.log(
      `Next bin day is ${res.name} on `,
      format(parseISO(res.date), "EEEE")
    );
  } else {
    console.log("couldnt determine bin day");
  }
});
