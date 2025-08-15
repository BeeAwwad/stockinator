import type { Timestamp } from "firebase/firestore"

export type ProfileProps = {
  uid: string
  businessId: string
  role: "owner" | "vendor" | "pending"
  invitedEmail?: string
  email: string
  displayName?: string
  createdAt: Date
}
export type ProductProps = {
  uid: string
  name: string
  sku: string
  price: number
  stock: number
  createdAt: Date
}

export type TransactionProps = {
  productId: string
  quantity: number
  total: number
  createdBy: string
  createdAt: Date
  verified: boolean
}

export type Transaction = {
  uid: string
  productId: string
  quantity: number
  total: number
  createdBy: string
  createdAt: Timestamp
  verified: boolean
  verifiedAt?: Timestamp
  verifiedBy?: string
}

export type PendingInvite = {
  uid: string
  email: string | null
  businessId: string
  invitedBy: string
  createdAt: string
  role: "vendor" | "pending" | "owner"
}

export type Notification = {
  id: string
  type: string
  toUserId: string
  read: boolean
  createdAt: Timestamp
  data: {
    email?: string
    inviteId?: string
    inviterId?: string
    businessId?: string
    declinedBy?: string
  }
}
