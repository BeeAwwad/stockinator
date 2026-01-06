import { useState, Activity, useEffect } from "react";
import InviteVendor from "@/components/dashboard/InviteVendors";
import VendorAndInviteList from "@/components/dashboard/VendorAndInviteList";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { useAppContext } from "@/hook/useAppContext";
import type {
  AnalyticsPeriod,
  AnalyticsRange,
  DashboardSummary,
  ProductProfitRow,
  SalesSeriesRow,
} from "@/lib/types";
import { dashboardStore } from "@/store/dashboardStore";
import { SalesChart } from "@/components/dashboard/SalesChart";
import {
  RangeSelector,
  MobileRangeSelector,
} from "@/components/dashboard/RangeSelector";
import { Spinner } from "@/components/ui/spinner";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import KPICard from "@/components/dashboard/KPICard";
import { ProductProfitChart } from "@/components/dashboard/ProductProfitChart";
import { useIsMobile } from "@/hook/useIsMobile";

const Dashboard = () => {
  const { profile, businessName } = useAppContext();
  const isMobile = useIsMobile();
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [period, setPeriod] = useState<AnalyticsPeriod>("day");

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [series, setSeries] = useState<SalesSeriesRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [productProfit, setProductProfit] = useState<ProductProfitRow[]>([]);

  useEffect(() => {
    if (!profile?.business_id) return;

    setLoading(true);

    Promise.all([
      dashboardStore.getSummary(profile.business_id, range),
      dashboardStore.getSalesSeries(profile.business_id, range, period),
      dashboardStore.getProductProfitSummary(profile.business_id, range),
    ])
      .then(([summaryData, seriesData, productProfitData]) => {
        setSummary(summaryData);
        setSeries(seriesData);
        setProductProfit(productProfitData);
      })
      .finally(() => setLoading(false));
  }, [profile?.business_id, range, period]);

  return (
    <>
      <div className="py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0 sm:max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto">
          <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
            {businessName ?? "Dashboard"}
          </h1>
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Activity mode={loading ? "visible" : "hidden"}>
              <Spinner />
            </Activity>
            <PeriodSelector value={period} onChange={setPeriod} />
            <Activity mode={!isMobile ? "visible" : "hidden"}>
              <RangeSelector value={range} onChange={setRange} />
            </Activity>
            <Activity mode={isMobile ? "visible" : "hidden"}>
              <MobileRangeSelector value={range} onChange={setRange} />
            </Activity>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto">
          <KPICard
            name={"total revenue"}
            data={`₦ ${summary?.total_revenue ?? 0}`}
          />
          <KPICard
            name={"top product"}
            data={summary?.top_product_name ?? "Top Product Na"}
          />
          <KPICard
            name={"total profit"}
            data={`₦ ${summary?.total_profit ?? 0}`}
          />
          <SalesChart data={series} />
          <ProductProfitChart
            data={productProfit}
            totalProfit={summary?.total_profit ?? 0}
          />
          <Card className="rounded shadow-none border w-full gap-2.5">
            <CardHeader>
              <CardTitle className="flex items-center">
                Team & Invites
              </CardTitle>
              <CardDescription>Manage your team members</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteVendor />
            </CardContent>
            <CardContent>
              <VendorAndInviteList />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
