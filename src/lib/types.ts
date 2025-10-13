export type ProfileProps = {
  id: string;
  business_id: string;
  role: "owner" | "vendor" | "unassigned";
  email: string;
  displayName?: string;
  createdAt: Date;
};
export type ProductProps = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  createdAt: Date;
};

export type TransactionProps = {
  productId: string;
  quantity: number;
  total: number;
  createdBy: string;
  createdAt: Date;
  verified: boolean;
};

export type Transaction = {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  createdBy: string;
  createdAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
};

export type PendingInvite = {
  id: string;
  email: string | null;
  businessId: string;
  invitedBy: string;
  createdAt: string;
  role: "vendor" | "unassigned" | "owner";
};

export type Notification = {
  id: string;
  type: string;
  toUserId: string;
  read: boolean;
  createdAt: Date;
  data: {
    email?: string;
    inviteId?: string;
    inviterId?: string;
    businessId?: string;
    declinedBy?: string;
  };
};
