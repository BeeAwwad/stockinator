import type { AnalyticsPeriod } from "@/lib/types";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";

const periods: AnalyticsPeriod[] = ["hour", "day", "week", "month"];

export function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as AnalyticsPeriod)}
    >
      <SelectTrigger className="bg-primary-400 active:bg-primary-300 text-white">
        <SelectValue placeholder="Granularity" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
