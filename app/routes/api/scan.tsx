import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redis } from "~/util/redis.server";
import { scrapeNextBinday } from "~/util/scrape.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json("Method not allowed", { status: 405 });
  }

  const res = await scrapeNextBinday();

  if (!res) {
    return json("Couldn't determine a bin day.", { status: 500 });
  }

  redis.setItem("binDay", JSON.stringify(res));

  return json("Scrape complete", { status: 200 });
};
