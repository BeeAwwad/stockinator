import { Card, CardContent } from "../ui/card";
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
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center flex-col">
          <div className="rounded-full size-10 flex items-center justify-center bg-primary-300 text-white">
            <Icon />
          </div>
        </div>

        <p className="my-auto flex flex-col gap-0.5 items-end">
          <span className="uppercase text-xs">{name}</span>
          <span className="font-semibold text-primary-100 tracking-tight text-3xl">
            {data}
          </span>
        </p>
      </CardContent>
    </Card>
  );
};

export default KPICard;
