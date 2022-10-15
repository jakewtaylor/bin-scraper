import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format, parseISO } from "date-fns";
import { redis } from "~/util/redis.server";
import type { BinDay } from "~/util/Scraper";

type LoaderData = {
  binDay: BinDay | null;
};

export const loader: LoaderFunction = async () => {
  const val = await redis.getItem("binDay");

  const binDay = val ? (JSON.parse(val) as BinDay) : null;

  return json<LoaderData>({ binDay });
};

export default function Index() {
  const { binDay } = useLoaderData<LoaderData>();

  return (
    <div
      className={`h-full w-full flex items-center justify-center p-2 ${
        binDay
          ? binDay.name === "Recycling"
            ? "bg-slate-600"
            : "bg-emerald-900"
          : "bg-red-500"
      }`}
    >
      <h1 className="font-bold text-lg text-left text-white text-opacity-80">
        {binDay ? (
          <>
            <span className="block">Next bin day is</span>
            <span className="block text-6xl mb-2">{binDay.name}</span>
            <span className="block text-right">
              on {format(parseISO(binDay.date), "EEEE")}
            </span>
          </>
        ) : (
          <>Couldn't work it out mate</>
        )}
      </h1>
    </div>
  );
}
