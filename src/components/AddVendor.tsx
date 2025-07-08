import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore"
import { db, auth } from "../firebase"
import { useAuthState } from "react-firebase-hooks/auth"

const AddVendor = () => {
  const [user] = useAuthState(auth)
  const [email, setEmail] = useState("")
  const [vendorCount, setVendorCount] = useState(0)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadBusinessId() {
      if (!user) return
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      if (profileData?.role !== "owner") return

      const bId = profileData.businessId
      setBusinessId(bId)

      const q = query(
        collection(db, "profiles"),
        where("businessId", "==", bId),
        where("role", "==", "vendor")
      )

      const vendorSnap = await getDocs(q)
      setVendorCount(vendorSnap.size)
    }

    loadBusinessId()
  }, [user])

  const handleAddVendor = async () => {
    setMessage("")
    if (!email || !businessId) return

    if (vendorCount >= 2) {
      setMessage("❌ Vendor limit reached (2 max).")
      return
    }

    try {
      // TEMP: Use email as ID placeholder (in real apps use Auth UID)
      const fakeVendorId = email.toLowerCase().replace(/[^a-z0-9]/g, "")

      const vendorRef = doc(db, "profiles", fakeVendorId)
      const snap = await getDoc(vendorRef)

      if (snap.exists()) {
        setMessage("⚠️ A vendor with this ID/email already exists.")
        return
      }

      await setDoc(vendorRef, {
        role: "vendor",
        businessId,
        createdAt: new Date(),
        invitedEmail: email,
      })

      setVendorCount((prev) => prev + 1)
      setEmail("")
      setMessage("✅ Vendor added successfully!")
    } catch (err) {
      console.error(err)
      setMessage("❌ Failed to add vendor.")
    }
  }

  if (!businessId) return null

  return (
    <div className="border p-4 mt-6 rounded bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Add Vendor</h3>
      <p className="text-sm text-gray-600 mb-4">
        Vendors allowed: {vendorCount}/2
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

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  )
}

export default AddVendor
