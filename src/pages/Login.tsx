import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth, db } from "../firebase"
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const signIn = async () => {
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { uid, displayName, email } = result.user

      const profileRef = doc(db, "profiles", uid)
      const profileSnap = await getDoc(profileRef)

      let role = "pending"

      if (!profileSnap.exists()) {
        // Check for a vendor invitation
        const q = query(
          collection(db, "profiles"),
          where("invitedEmail", "==", email),
          where("role", "==", "vendor")
        )
        const invitedSnap = await getDocs(q)

        if (!invitedSnap.empty) {
          const invitedDoc = invitedSnap.docs[0]
          const invitedData = invitedDoc.data()

          await setDoc(profileRef, {
            ...invitedData,
            invitedEmail: null,
            displayName,
          })

          await deleteDoc(invitedDoc.ref)
          role = "vendor"
        } else {
          // Create new profile with pending role
          await setDoc(profileRef, {
            role: "pending",
            businessId: null,
            displayName,
            createdAt: new Date(),
          })
        }
      } else {
        // Profile already exists → use its role
        const existingProfile = profileSnap.data()
        role = existingProfile?.role || "pending"
      }

      // ✅ Redirect based on role
      if (role === "owner" || role === "vendor") {
        navigate("/")
      } else {
        navigate("/register")
      }
    } catch (err) {
      console.error("Login failed:", err)
      alert("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Signing you in...</p>
        </div>
      ) : (
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
          onClick={signIn}
        >
          Sign in with Google
        </button>
      )}
    </div>
  )
}

export default Login
