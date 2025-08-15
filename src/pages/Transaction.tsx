import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import {
  getDoc,
  collection,
  getDocs,
  doc,
  runTransaction,
  // addDoc,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import AddTransaction from "@/components/AddTransaction"
import TransactionList from "@/components/TransactionList"
import type { ProductProps, ProfileProps, TransactionProps } from "@/lib/types"
import { toast } from "sonner"

export default function Transaction() {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileProps | null>(null)
  const [products, setProducts] = useState<ProductProps[]>([])

  const fetchData = async () => {
    if (!user) return

    const profileSnap = await getDoc(doc(db, "profiles", user.uid))
    const profileData = profileSnap.data()
    setProfile((profileData as ProfileProps) ?? null)

    if (profileData?.businessId) {
      const productsSnap = await getDocs(
        collection(db, "businesses", profileData.businessId, "products")
      )
      setProducts(
        productsSnap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as ProductProps[]
      )
    }
  }

  const createTransaction = async (data: TransactionProps) => {
    try {
      const { productId, quantity, total } = data
      const qty = Number(quantity)
      if (!profile?.businessId || !productId || !qty) return

      const productRef = doc(
        db,
        "businesses",
        profile.businessId,
        "products",
        productId
      )

      const transactionsRef = collection(
        db,
        "businesses",
        profile.businessId,
        "transactions"
      )

      await runTransaction(db, async (tx) => {
        const productSnap = await tx.get(productRef)
        if (!productSnap.exists()) throw new Error("Product not found")

        const stock = productSnap.data().stock || 0
        const newStock = stock - qty

        if (newStock < 0) {
          toast.error("Insufficient stock")
          throw new Error("Insufficient stock")
        }

        tx.set(
          productRef,
          { stock: newStock, updatedBy: user?.email ?? "unknown" },
          { mergeFields: ["stock", "updatedBy"] }
        )
        const newTransactionRef = doc(transactionsRef)
        tx.set(newTransactionRef, {
          productId,
          quantity: qty,
          total,
          createdBy: user?.email ?? "unknown",
          createdAt: new Date(),
          verified: false,
        })
      })
      toast.success("Transaction created")
    } catch (error) {
      console.error("Failed to create transaction:", error)
      toast.error("An error occurred while processing the transaction.")
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  if (!profile) return <p>Loading...</p>

  return (
    <div className="py-6 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
      <AddTransaction
        products={products}
        onSubmit={createTransaction}
        businessId={profile.businessId}
        createdBy={user?.email || "Unknown"}
      />
      <TransactionList
        businessId={profile.businessId}
        isOwner={profile.role === "owner"}
        products={products}
      />
    </div>
  )
}
