"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const INITIAL_FORM = { name: "", sku: "", price: "", stock: "" }

export default function AddProduct({ businessId }: { businessId: string }) {
  const [form, setForm] = useState(INITIAL_FORM)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const generateSKU = (name: string) =>
    `${name.slice(0, 3).toLocaleUpperCase()}-${Date.now().toString().slice(-5)}`

  const handleSubmit = async () => {
    const { name, price, stock } = form
    if (!businessId) return

    const sku = generateSKU(form.name)

    const productsRef = collection(db, "businesses", businessId, "products")

    await addDoc(productsRef, {
      name,
      sku,
      price: Number(price),
      stock: Number(stock),
      createdAt: serverTimestamp(),
    })

    setForm(INITIAL_FORM)
  }

  return (
    <div className="space-y-2">
      {["name", "price", "stock"].map((field) => (
        <Input
          className="placeholder:text-sm"
          key={field}
          name={field}
          placeholder={field[0].toUpperCase() + field.slice(1)}
          type={field === "price" || field === "stock" ? "number" : "text"}
          value={form[field as keyof typeof form]}
          onChange={handleChange}
        />
      ))}
      <Button onClick={handleSubmit} className="w-full mt-3">
        Add Product
      </Button>
    </div>
  )
}
