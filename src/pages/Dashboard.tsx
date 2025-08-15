import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../lib/firebase"
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import type { ProfileProps } from "@/lib/types"
import AddVendor from "@/components/AddVendor"
import VendorList from "@/components/VendorList"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { twMerge } from "tailwind-merge"

const Dashboard = () => {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileProps | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [confirmName, setConfirmName] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const loadProfileAndBusiness = async () => {
        const profileRef = doc(db, "profiles", user.uid)
        const profileSnap = await getDoc(profileRef)

        if (!profileSnap.exists()) return

        const profileData = profileSnap.data() as ProfileProps
        setProfile(profileData)

        if (profileData.businessId) {
          const businessRef = doc(db, "businesses", profileData.businessId)
          const businessSnap = await getDoc(businessRef)

          if (businessSnap.exists()) {
            const { name } = businessSnap.data()
            setBusinessName(name)
          }
        }
      }

      loadProfileAndBusiness()
    }
  }, [user])

  const handleDelete = async (businessId: string) => {
    if (profile?.role !== "owner") return
    try {
      // Delete products
      const productsRef = collection(db, "businesses", businessId, "products")
      const productDocs = await getDocs(productsRef)
      for (const docSnap of productDocs.docs) {
        await deleteDoc(docSnap.ref)
      }

      // Delete transactions
      const transactionsRef = collection(
        db,
        "businesses",
        businessId,
        "transactions"
      )
      const txDocs = await getDocs(transactionsRef)
      for (const docSnap of txDocs.docs) {
        await deleteDoc(docSnap.ref)
      }

      // Delete business document
      await deleteDoc(doc(db, "businesses", businessId))

      // Remove businessId + role from all associated profiles
      const profilesRef = collection(db, "profiles")
      const q = query(profilesRef, where("businessId", "==", businessId))
      const profilesSnap = await getDocs(q)

      const batch = writeBatch(db)
      profilesSnap.forEach((profileDoc) => {
        batch.update(profileDoc.ref, {
          businessId: null,
          role: "pending",
        })
      })
      await batch.commit()

      toast.success("Business deleted successfully.")
      navigate("/register-business")
    } catch (err) {
      console.error("Failed to delete business:", err)
      toast.error("Failed to delete business.")
    }
  }

  return (
    <>
      <div className="py-6">
        <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 w-fit">
          Dashboard
        </h1>

        {profile && (
          <div className="space-y-1">
            {businessName ? (
              <p className="mt-2">
                Business Name:{" "}
                <span className="font-semibold">{businessName}</span>
              </p>
            ) : (
              <p className="mt-2 text-gray-500">Loading business name...</p>
            )}

            {profile.role === null && (
              <p className="text-yellow-600">
                Create a business first.
                <Link to="/create-business" className="hover:underline">
                  Create Business
                </Link>
              </p>
            )}
            {profile.role === "owner" && (
              <>
                <p>
                  User:{" "}
                  <span className="font-semibold">{profile.displayName}</span>
                </p>
                <p>You are the owner of this business.</p>
              </>
            )}
            {profile.role === "vendor" && (
              <>
                <p>
                  User:{" "}
                  <span className="font-semibold">{profile.displayName}</span>
                </p>
                <p>You are a vendor for this business.</p>
              </>
            )}
          </div>
        )}
        {profile?.role === "owner" && (
          <Button
            className="mt-4 bg-rose-500"
            onClick={() => {
              setBusinessId(profile.businessId)
              setDeleteDialogOpen(true)
            }}
          >
            Delete Business
          </Button>
        )}
      </div>

      <AddVendor />
      <VendorList />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your business, all products, and all
              transactions.
            </AlertDialogDescription>
            <div className="space-y-2 my-4">
              <p className="text-sm text-gray-500">
                To confirm, type{" "}
                <span className="text-gray-950 font-medium">
                  "{businessName}"
                </span>{" "}
                below:
              </p>
              <Input
                placeholder="Type business name to confirm"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className={twMerge(
                  "text-sm",
                  confirmName &&
                    confirmName !== businessName &&
                    "border-rose-500",
                  confirmName === businessName && "border-green-500"
                )}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmName !== businessName}
              onClick={async () => {
                if (businessId) {
                  await handleDelete(businessId)
                  setDeleteDialogOpen(false)
                  setBusinessId(null)
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Dashboard
