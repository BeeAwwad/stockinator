import { useAuthState } from "react-firebase-hooks/auth"
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  // getDoc,
} from "firebase/firestore"
import { db, auth } from "../lib/firebase"
import { useEffect, useState } from "react"
import type { ProfileProps } from "@/lib/types"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"

const VendorList = () => {
  const [user] = useAuthState(auth)
  const [vendors, setVendors] = useState<ProfileProps[]>([])
  const [invites, setInvites] = useState<{ id: string; email: string }[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    type: "vendor" | "invite"
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const profileRef = doc(db, "profiles", user.uid)

    const unsubscribe = onSnapshot(profileRef, async (snap) => {
      const profileData = snap.data()
      if (!profileData?.businessId) return

      setBusinessId(profileData.businessId)
      setIsOwner(profileData.role === "owner")

      const vendorQuery = query(
        collection(db, "profiles"),
        where("businessId", "==", profileData.businessId),
        where("role", "==", "vendor")
      )

      const inviteQuery = query(
        collection(db, "invites"),
        where("businessId", "==", profileData.businessId),
        where("role", "==", "vendor")
      )

      const unsubscribeVendors = onSnapshot(vendorQuery, (snap) => {
        const list = snap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as ProfileProps[]
        setVendors(list)
      })

      const unsubscribeInvites = onSnapshot(inviteQuery, (snap) => {
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email,
        }))
        setInvites(list)
      })

      setLoading(false)

      // cleanup nested listeners when auth or businessId changes
      return () => {
        unsubscribeVendors()
        unsubscribeInvites()
      }
    })

    return () => unsubscribe()
  }, [user])

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const { id, type } = pendingDelete

    try {
      if (type === "vendor") {
        await deleteDoc(doc(db, "profiles", id))
        toast.success("Vendor removed.")
      } else {
        await deleteDoc(doc(db, "invites", id))
        toast.success("Invite cancelled.")
      }
    } catch (err) {
      console.error("Failed to delete:", err)
      toast.error("Failed to remove. Please try again.")
    } finally {
      setPendingDelete(null)
    }
  }

  if (loading) return <p>Loading vendors...</p>
  if (!businessId) return null

  return (
    <div className="mt-6">
      <h2 className="font-bold mb-2">Vendors</h2>

      {vendors.length === 0 && invites.length === 0 ? (
        <p className="text-sm text-gray-500">No vendors yet.</p>
      ) : (
        <ul className="space-y-2">
          {vendors.map((v, i) => (
            <li
              key={v.uid}
              className="flex justify-between items-center bg-green-50 p-2 rounded"
            >
              <div>{v.displayName || v.email || `Vendor ${i + 1}`}</div>
              {isOwner && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() =>
                    setPendingDelete({ id: v.uid, type: "vendor" })
                  }
                >
                  Remove
                </Button>
              )}
            </li>
          ))}

          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex justify-between items-center bg-yellow-50 p-2 rounded"
            >
              <div>
                {inv.email}
                <span className="text-xs text-yellow-600 ml-2">(Invited)</span>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() =>
                    setPendingDelete({ id: inv.id, type: "invite" })
                  }
                >
                  Cancel
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={() => setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.type === "vendor"
                ? "Remove Vendor?"
                : "Cancel Invite?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.type === "vendor"
                ? "Are you sure you want to remove this vendor?"
                : "Are you sure you want to cancel this invite?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default VendorList
