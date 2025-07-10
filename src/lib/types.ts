export type ProfileType = {
  uid: string
  businessId: string
  role: "owner" | "vendor" | "pending"
  invitedEmail?: string
  email: string
  displayName?: string
  createdAt: Date
}
export type ProductType = {
  uid: string
  name: string
  sku: string
  price: number
  stock: number
  createdAt: Date
}

export type TransactionType = {
  uid: string
  productId: string
  quantity: number
  type: string
  notes: string
  createdAt: Date
}
