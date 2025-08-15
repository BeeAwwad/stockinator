"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import type { ProfileProps } from "@/lib/types"
import AddProduct from "@/components/AddProduct"
import ProductList from "@/components/ProductList"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

export default function ProductsPage() {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileProps | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const snap = await getDoc(doc(db, "profiles", user.uid))
      const data = snap.data() as ProfileProps
      setProfile(data)
    }

    fetchProfile()
  }, [user])

  if (!profile) return <p>Loading...</p>

  return (
    <div className="py-6 flex flex-col items-center">
      {profile.role === "owner" && (
        <Card className="w-full grid gap-4 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl">
          <CardHeader>
            <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Add Product
            </CardTitle>
            <CardDescription>Add products to your businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <AddProduct
              isOwner={profile.role === "owner"}
              businessId={profile.businessId}
            />
          </CardContent>
        </Card>
      )}
      <ProductList
        businessId={profile.businessId}
        isOwner={profile.role === "owner"}
      />
    </div>
  )
}
