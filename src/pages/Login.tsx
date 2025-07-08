import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth, db } from "../firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

const Login = () => {
  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    const { uid, displayName } = result.user
    console.log("🚀 ~ signIn ~ displayName:", displayName)

    // Check if profile exists
    const profileRef = doc(db, "profiles", uid)
    const profileSnap = await getDoc(profileRef)

    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        role: "vendor",
        businessId: null,
        createdAt: new Date(),
      })
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded"
        onClick={signIn}
      >
        Sign in with Google
      </button>
    </div>
  )
}

export default Login
