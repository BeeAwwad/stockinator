import { useState, useEffect } from "react"
import { auth, db } from "../lib/firebase"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
      console.log("🚀 ~ businessRef ~ user.uid:", user.uid)

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
    <div className="p-6 mt-8 flex justify-center">
      <Card className="w-full max-w-sm py-6 md:max-w-md lg:max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>Give your business a name</CardDescription>
          </CardHeader>
          <CardContent className="my-5">
            <Input
              type="text"
              className="border w-full p-2 rounded"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Business"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Register
