import { Card, CardContent } from "./ui/card";
import { DollarSign, Crown, TrendingUp, type LucideIcon } from "lucide-react";

type KPICardProps = {
  name: "total revenue" | "total profit" | "top product";
  data: string | number;
};

const IconMap: Record<KPICardProps["name"], LucideIcon> = {
  "top product": Crown,
  "total profit": TrendingUp,
  "total revenue": DollarSign,
};

const KPICard = ({ name, data }: KPICardProps) => {
  const Icon = IconMap[name];
  return (
    <Card className="rounded">
      <CardContent>
        <div className="grid grid-cols-2 justify-items-center">
          <div className="rounded-full size-10 flex items-center justify-center bg-primary-300 text-white">
            <Icon />
          </div>
          <p className="my-auto flex flex-col gap-0.5 items-end">
            <span className="uppercase text-sm">{name}</span>
            <span className="font-semibold tracking-tight">{data}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
