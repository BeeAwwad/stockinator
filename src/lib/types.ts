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
  stock: number;
  created_at: Date;
};

export type TransactionProps = {
  product_id: string;
  amount: number;
  total: number;
  created_by: string;
  created_at: Date;
  verified: boolean;
};

export type Transaction = {
  id: string;
  product_id: string;
  amount: number;
  total: number;
  created_by: string;
  created_at: Date;
  verified: boolean;
};

export type PendingInvite = {
  id: string;
  email: string | null;
  business_id: string;
  invited_by: string;
  created_at: string;
  role: "vendor" | "unassigned" | "owner";
};

export type Notification = {
  id: string;
  type: string;
  to_user_id: string;
  read: boolean;
  created_at: Date;
  data: {
    email?: string;
    invite_id?: string;
    inviter_id?: string;
    business_id?: string;
    declined_by?: string;
  };
};
