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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

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
    <div className="flex items-center">
      <Card className="w-full max-w-sm md:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle>Add Vendor</CardTitle>
          <CardDescription>Vondors invited: {vendorCount}/2</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Vendor's email"
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleAddVendor}
            disabled={!email || vendorCount >= 2}
          >
            Add Vendor
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AddVendor
