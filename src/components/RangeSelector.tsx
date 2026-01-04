import type { AnalyticsRange } from "@/lib/types";
import { Button } from "./ui/button";

const ranges: AnalyticsRange[] = ["24h", "7d", "1m", "3m", "6m", "1y"];

export function RangeSelector({
  value,
  onChange,
}: {
  value: AnalyticsRange;
  onChange: (r: AnalyticsRange) => void;
}) {
  return (
    <div className="flex gap-2">
      {ranges.map((r, index) => (
        <Button
          key={index}
          size={"icon"}
          onClick={() => onChange(r)}
          className={`rounded ${
            value === r ? "bg-primary-300 text-white" : "bg-primary-100"
          } text-xs hover:bg-primary-400`}
        >
          {r}
        </Button>
      ))}
    </div>
  );
}
