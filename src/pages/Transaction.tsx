import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  //   query,
  serverTimestamp,
  //   where,
} from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import { doc } from "firebase/firestore"
import Layout from "@/components/Layout"
import type { ProductType, ProfileType } from "@/lib/types"

const Transaction = () => {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [products, setProducts] = useState<ProductType[]>([])
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    type: "OUT",
    notes: "",
  })

  const fetchData = async () => {
    if (!user) return

    const profileSnap = await getDoc(doc(db, "profiles", user.uid))
    const profileData = profileSnap.data()
    setProfile((profileData as ProfileType) ?? null)

    if (profileData?.businessId) {
      const productsSnap = await getDocs(
        collection(db, "businesses", profileData.businessId, "products")
      )
      setProducts(
        productsSnap.docs.map(
          (doc) => ({ uid: doc.id, ...doc.data() } as ProductType)
        )
      )
    }
  }

  const createTransaction = async () => {
    const { productId, quantity, type, notes } = form
    if (!profile?.businessId) return

    const transactionsRef = collection(
      db,
      "businesses",
      profile.businessId,
      "transactions"
    )
    await addDoc(transactionsRef, {
      productId,
      type,
      quantity: Number(quantity),
      notes,
      createdAt: serverTimestamp(),
    })

    setForm({ productId: "", quantity: "", type: "OUT", notes: "" })
  }

  useEffect(() => {
    fetchData()
  }, [user])

  if (!profile) return <p>Loading...</p>

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Create Transaction</h1>

        <select
          className="border p-2 rounded w-full mb-2"
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product.uid} value={product.uid}>
              {product.name} (Stock: {product.stock})
            </option>
          ))}
        </select>

        {profile.role === "owner" && (
          <select
            className="border p-2 rounded w-full mb-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        )}

        {profile.role === "vendor" && <input type="hidden" value="OUT" />}

        <input
          placeholder="Quantity"
          type="number"
          className="border p-2 rounded w-full mb-2"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          placeholder="Notes"
          className="border p-2 rounded w-full mb-4"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button
          onClick={createTransaction}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </Layout>
  )
}

export default Transaction
