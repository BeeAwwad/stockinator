import { useAuthState } from "react-firebase-hooks/auth"
import { db, auth } from "../firebase"
import {
  doc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import type { ProfileType } from "@/utils/types"

const VendorList = () => {
  const [user] = useAuthState(auth)
  const [vendors, setVendors] = useState<ProfileType[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVendors() {
      if (!user) return
      setLoading(true)

      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      if (!profileData?.businessId) return

      setIsOwner(profileData.role === "owner")
      setBusinessId(profileData.businessId)

      const vendorsRef = collection(db, "profiles")
      const q = query(
        vendorsRef,
        where("businessId", "==", profileData.businessId),
        where("role", "==", "vendor")
      )

      const snap = await getDocs(q)
      const vendorList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProfileType[]

      setVendors(vendorList)
      setLoading(false)
    }

    fetchVendors()
  }, [user])

  const handleRemove = async (vendorId: string) => {
    const confirmed = confirm("Are you sure you want to remove this vendor?")
    if (!confirmed || !vendorId || vendorId === user?.uid) return

    try {
      await deleteDoc(doc(db, "profiles", vendorId))
      setVendors((prev) => prev.filter((v) => v.id !== vendorId))
    } catch (err) {
      console.error("Failed to delete vendor:", err)
    }
  }

  if (loading) return <p>Loading vendors...</p>
  if (!businessId) return null

  return (
    <div className="mt-6">
      <h2 className="font-bold mb-2">Vendors in Business</h2>
      {vendors.length === 0 ? (
        <p className="text-sm text-gray-500">No vendors yet.</p>
      ) : (
        <ul className="space-y-2">
          {vendors.map((v, i) => (
            <li
              key={v.id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <div>
                {v.displayName || v.invitedEmail || `Vendor ${i + 1}`}
                {!v.displayName && (
                  <span className="text-xs text-yellow-600 ml-2">
                    (Pending)
                  </span>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => handleRemove(v.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default VendorList
