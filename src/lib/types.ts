export type ProfileProps = {
  id: string;
  business_id: string;
  role: "owner" | "vendor" | "unassigned";
  email: string;
  display_name?: string;
  created_at: Date;
};

export type ProductProps = {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  stock: number;
  business_id: string;
  image_url: string | null;
  created_at: Date;
};

export type TransactionProps = {
  id: string;
  business_id: string;
  created_by: string;
  created_at: Date;
  verified: boolean;
  items: TransactionItem[];
  created_by_email?: {
    email: string;
  };
};

export type TransactionItemDraft = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
  };
};

export type InviteProps = {
  id: string;
  business_id: string;
  invited_user_id: string;
  invited_by: string;
  created_at: string;
  status: "pending" | "accepted" | "declined";
  inviter?: {
    email: string;
  };
  invited?: {
    email: string;
  };
};

export type AnalyticsRange = "24h" | "7d" | "1m" | "3m" | "6m" | "1y";

export type AnalyticsPeriod = "hour" | "day" | "week" | "month";

export type DashboardSummary = {
  total_revenue: number;
  total_profit: number;
  total_transactions: number;
  top_product_id: string | null;
  top_product_name: string | null;
};

export type SalesSeriesRow = {
  interval_start: string;
  revenue: number;
  transaction_count: number;
};

export type ProductProfitRow = {
  product_id: string;
  product_name: string;
  profit: number;
};

export type CachedEntry<T> = {
  data: T;
  fetchedAt: number;
};
