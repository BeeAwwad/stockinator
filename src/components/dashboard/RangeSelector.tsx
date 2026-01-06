import type { AnalyticsRange } from "@/lib/types";
import { Button } from "../ui/button";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";

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

export function MobileRangeSelector({
  value,
  onChange,
}: {
  value: AnalyticsRange;
  onChange: (p: AnalyticsRange) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as AnalyticsRange)}
    >
      <SelectTrigger className="bg-primary-300 active:bg-primary-300 text-white">
        <SelectValue placeholder="Range" />
      </SelectTrigger>
      <SelectContent>
        {ranges.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
