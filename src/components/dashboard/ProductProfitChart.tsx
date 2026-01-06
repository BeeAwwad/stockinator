"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProductProfitRow } from "@/lib/types";

export function ProductProfitChart({
  data,
  totalProfit,
}: {
  data: ProductProfitRow[];
  totalProfit: number;
}) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      product: item.product_name,
      profit: Number(item.profit),
      fill: `var(--chart-${(index % 5) + 1})`,
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      profit: { label: "Profit" },
    };
    data.forEach((item, index) => {
      config[item.product_name] = {
        label: item.product_name,
        color: `var(--chart-${(index % 5) + 1})`,
      };
    });
    return config;
  }, [data]);

  return (
    <Card className="md:col-span-2 flex flex-col border-none shadow-none bg-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>Profit by Product</CardTitle>
        <CardDescription>Top contributors to revenue</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="profit"
              nameKey="product"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl font-bold"
                        >
                          ₦{totalProfit.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Total Profit
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
