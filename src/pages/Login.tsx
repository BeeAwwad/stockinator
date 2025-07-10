import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { auth, db } from "../lib/firebase"
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
import type { User } from "firebase/auth"
import { toast } from "sonner"
const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const handleAuth = async (user: User) => {
    const { uid, displayName, email } = user
    const profileRef = doc(db, "profiles", uid)
    let role = "pending"

    try {
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const profile = profileSnap.data()
        role = profile?.role || "pending"
      } else {
        if (!email) {
          toast.error("Missing email. Cannot proceed.")
          return
        }

        // Check invites
        const inviteQuery = query(
          collection(db, "invites"),
          where("email", "==", email)
        )
        const invitedSnap = await getDocs(inviteQuery)

        if (!invitedSnap.empty) {
          const inviteDoc = invitedSnap.docs[0]
          const inviteData = inviteDoc.data()

          await setDoc(profileRef, {
            role: "vendor",
            businessId: inviteData.businessId,
            displayName: displayName || email,
            createdAt: new Date(),
          })

          await deleteDoc(inviteDoc.ref)
          role = "vendor"
        } else {
          await setDoc(profileRef, {
            role: "pending",
            businessId: null,
            displayName: displayName || email,
            createdAt: new Date(),
          })
        }
      }

      // Navigate
      navigate(role === "owner" || role === "vendor" ? "/" : "/register")
    } catch (err) {
      console.error("Auth error:", err)
      toast.error("Failed to handle login. Check console for details.")
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await handleAuth(result.user)
    } catch (err) {
      console.error("Google login failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async () => {
    try {
      setLoading(true)
      const result = isRegistering
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password)

      await handleAuth(result.user)
    } catch (err) {
      console.error("Email auth error:", err)
      toast.error("Login failed. Please check your credentials or try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md bg-white shadow p-6 rounded">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isRegistering ? "Create Account" : "Sign In"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded mb-2"
        >
          {isRegistering ? "Sign Up with Email" : "Login with Email"}
        </button>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border py-2 rounded"
        >
          Continue with Google
        </button>

        <p className="text-sm mt-4 text-center">
          {isRegistering ? "Already have an account?" : "Need an account?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 underline"
          >
            {isRegistering ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
