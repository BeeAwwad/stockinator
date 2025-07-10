import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore"
import { db, auth } from "../lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { toast } from "sonner"
import { nanoid } from "nanoid"

const AddVendor = () => {
  const [user] = useAuthState(auth)
  const [email, setEmail] = useState("")
  const [vendorCount, setVendorCount] = useState(0)
  const [businessId, setBusinessId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadAndListen = async () => {
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      if (profileData?.role !== "owner") return

      const bId = profileData.businessId
      setBusinessId(bId)

      const invitesQuery = query(
        collection(db, "invites"),
        where("businessId", "==", bId),
        where("role", "==", "vendor")
      )

      const unsubscribe = onSnapshot(invitesQuery, (snap) => {
        setVendorCount(snap.size)
      })

      return unsubscribe
    }

    const cleanup = loadAndListen()

    return () => {
      cleanup?.then((unsubscribe) => unsubscribe?.())
    }
  }, [user])

  const handleAddVendor = async () => {
    const vendorEmail = email.trim().toLowerCase()

    if (!vendorEmail || !businessId) return

    if (vendorCount >= 2) {
      toast.error("Vendor limit reached (2 max).")
      return
    }

    try {
      const inviteId = nanoid()

      await setDoc(doc(db, "invites", inviteId), {
        email: vendorEmail,
        businessId,
        role: "vendor",
        invitedBy: user?.uid,
        createdAt: Timestamp.now(),
      })

      setEmail("")
      toast.success("Vendor invited successfully!")
    } catch (err) {
      console.error("Failed to invite vendor:", err)
      toast.error("Failed to invite vendor. Please try again.")
    }
  }

  if (!businessId) return null

  return (
    <div className="border p-4 mt-6 rounded bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Add Vendor</h3>
      <p className="text-sm text-gray-600 mb-4">
        Vendors invited: {vendorCount}/2
      </p>

      <input
        type="email"
        placeholder="Vendor's email"
        className="border p-2 w-full rounded mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleAddVendor}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!email || vendorCount >= 2}
      >
        Add Vendor
      </button>
    </div>
  )
}

export default AddVendor
