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
