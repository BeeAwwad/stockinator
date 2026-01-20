import type { AnalyticsRange } from "./types";
import { subHours, subDays, subMonths, subYears } from "date-fns";

export const getStartDate = (range: AnalyticsRange): Date => {
  const now = new Date();
  switch (range) {
    case "24h":
      return subHours(now, 24);
    case "7d":
      return subDays(now, 7);
    case "1m":
      return subMonths(now, 1);
    case "3m":
      return subMonths(now, 3);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
    default:
      return subHours(now, 24);
  }
};
