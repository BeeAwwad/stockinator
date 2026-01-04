import { supabase } from "@/lib/supabaseClient";
import { getStartDate } from "@/lib/functions";
import type {
  AnalyticsPeriod,
  AnalyticsRange,
  DashboardSummary,
  SalesSeriesRow,
  ProductProfitRow,
  CachedEntry,
} from "@/lib/types";

type Cache = {
  summary: Record<string, CachedEntry<DashboardSummary>>;
  salesSeries: Record<string, CachedEntry<SalesSeriesRow[]>>;
  productProfitSummary: Record<string, CachedEntry<ProductProfitRow[]>>;
};

export class DashboardStore {
  private cache: Cache = {
    summary: {},
    salesSeries: {},
    productProfitSummary: {},
  };

  private summaryKey(bid: string, range: AnalyticsRange) {
    return `${bid}|${range}`;
  }

  private seriesKey(
    bid: string,
    range: AnalyticsRange,
    period: AnalyticsPeriod
  ) {
    return `${bid}|${range}|${period}`;
  }

  async getSummary(bid: string, range: AnalyticsRange) {
    const key = this.summaryKey(bid, range);
    if (this.cache.summary[key]) return this.cache.summary[key].data;

    const { data, error } = await supabase.rpc("get_dashboard_summary", {
      bid,
      start_date: getStartDate(range).toISOString(),
    });

    if (error) throw error;

    this.cache.summary[key] = {
      data: data[0],
      fetchedAt: Date.now(),
    };

    return data[0];
  }

  async getSalesSeries(
    bid: string,
    range: AnalyticsRange,
    period: AnalyticsPeriod
  ) {
    const key = this.seriesKey(bid, range, period);
    if (this.cache.salesSeries[key]) return this.cache.salesSeries[key].data;

    const { data, error } = await supabase.rpc("get_sales_timeseries", {
      bid,
      period,
      start_date: getStartDate(range).toISOString(),
    });

    if (error) throw error;

    this.cache.salesSeries[key] = {
      data: data ?? [],
      fetchedAt: Date.now(),
    };

    return data ?? [];
  }

  async getProductProfitSummary(bid: string, range: AnalyticsRange) {
    const key = this.summaryKey(bid, range);
    if (this.cache.productProfitSummary[key])
      return this.cache.productProfitSummary[key].data;

    const { data, error } = await supabase.rpc("get_product_profit_summary", {
      bid,
      start_date: getStartDate(range).toISOString(),
    });

    if (error) throw error;

    this.cache.productProfitSummary[key] = {
      data: data ?? [],
      fetchedAt: Date.now(),
    };

    return data ?? [];
  }

  invalidateBusiness(bid: string) {
    const domains = Object.keys(this.cache) as (keyof Cache)[];
    domains.forEach((domain) => {
      this.cache[domain] = Object.fromEntries(
        Object.entries(this.cache[domain]).filter(
          ([key]) => !key.startsWith(bid)
        )
      );
    });
  }
}

export const dashboardStore = new DashboardStore();
