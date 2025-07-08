import { useState, useEffect } from "react"
import { auth, db } from "../firebase"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"

const Register = () => {
  const [user] = useAuthState(auth)
  const [businessName, setBusinessName] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user already has a business
  useEffect(() => {
    const checkExistingBusiness = async () => {
      if (!user) return

      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      if (profileData?.businessId) {
        // Redirect if business already exists
        navigate("/")
      }
    }

    checkExistingBusiness()
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName || !user) return

    setLoading(true)

    try {
      // Create business
      const businessRef = await addDoc(collection(db, "businesses"), {
        name: businessName,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      })

      // Update user profile with businessId and role
      const profileRef = doc(db, "profiles", user.uid)
      await updateDoc(profileRef, {
        businessId: businessRef.id,
        role: "owner",
      })

      navigate("/") // redirect to dashboard
    } catch (err) {
      console.error("Error creating business:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register Your Business</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="border w-full p-2 rounded"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Creating..." : "Create Business"}
        </button>
      </form>
    </div>
  )
}

export default Register
