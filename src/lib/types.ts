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
  id: string;
  product_id: string;
  amount: number;
  total: number;
  created_by: string;
  created_at: Date;
  verified: boolean;
  created_by_email?: {
 	email: string; 
  }
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
