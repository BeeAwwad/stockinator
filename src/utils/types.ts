export type ProfileType = {
  id: string
  businessId: string
  role: "owner" | "vendor" | "pending"
  invitedEmail?: string
  displayName?: string
  createdAt: Date
}
export type ProductType = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  createdAt: Date
}

export type TransactionType = {
  productId: string
  quantity: number
  type: string
  notes: string
  createdAt: Date
}
