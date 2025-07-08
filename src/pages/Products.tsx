import {
  collection,
  addDoc,
  query,
  //   where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import Layout from "@/components/Layout"
import type { ProductType, ProfileType } from "@/utils/types"

const Products = () => {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [products, setProducts] = useState<ProductType[]>([])
  const [form, setForm] = useState({ name: "", sku: "", price: "", stock: "" })

  const fetchProfileAndProducts = async () => {
    if (!user) return

    const profileRef = doc(db, "profiles", user.uid)
    const profileSnap = await getDoc(profileRef)
    const profileData = profileSnap.data()
    setProfile((profileData as ProfileType) ?? null)

    if (profileData?.businessId) {
      const productsRef = collection(
        db,
        "businesses",
        profileData.businessId,
        "products"
      )
      const q = query(productsRef)
      const snap = await getDocs(q)
      setProducts(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ProductType))
      )
    }
  }

  const createProduct = async () => {
    const { name, sku, price, stock } = form
    if (!profile?.businessId) return

    const productsRef = collection(
      db,
      "businesses",
      profile.businessId,
      "products"
    )

    await addDoc(productsRef, {
      name,
      sku,
      price: Number(price),
      stock: Number(stock),
      createdAt: serverTimestamp(),
    })

    setForm({ name: "", sku: "", price: "", stock: "" })
    fetchProfileAndProducts()
  }

  useEffect(() => {
    fetchProfileAndProducts()
  }, [user])

  if (!profile) return <p>Loading profile...</p>

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Product Inventory</h1>

        {profile.role === "owner" && (
          <div className="mb-6 space-y-2">
            <input
              placeholder="Name"
              className="border rounded p-2 block w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="SKU"
              className="border rounded p-2 block w-full"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <input
              placeholder="Price"
              className="border rounded p-2 block w-full"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              placeholder="Initial Stock"
              className="border rounded p-2 block w-full"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <button
              onClick={createProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Product
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded">
              <h2 className="font-semibold">{product.name}</h2>
              <p>SKU: {product.sku}</p>
              <p>Price: ₦{product.price}</p>
              <p>Stock: {product.stock}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Products
