import { useEffect, useState } from "react"
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { ProductProps, Transaction } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { useAuthState } from "react-firebase-hooks/auth"

export default function TransactionList({
  businessId,
  isOwner,
  products,
}: {
  businessId: string
  isOwner: boolean
  products: ProductProps[]
}) {
  const [user] = useAuthState(auth)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [pendingVerifyId, setPendingVerifyId] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) {
      toast.error("You're not allowed to delete this tranasaction.")
      return
    }
    const q = query(
      collection(db, "businesses", businessId, "transactions"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() } as Transaction)
      )
      setTransactions(list)
    })

    return () => unsubscribe()
  }, [businessId])

  const handleVerify = async (transactionId: string) => {
    if (!isOwner) return
    const transactionRef = doc(
      db,
      "businesses",
      businessId,
      "transactions",
      transactionId
    )

    await updateDoc(transactionRef, {
      verified: true,
      verifiedAt: Timestamp.now(),
      verifiedBy: user?.email || "Unknown",
    })
      .then(() => toast.success("Transaction verified"))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to verify transaction")
      })
  }

  const handleDelete = async (transactionId: string) => {
    if (!isOwner) return
    deleteDoc(doc(db, "businesses", businessId, "transactions", transactionId))
      .then(() => toast.success("Transaction deleted"))
      .catch((err) => {
        console.error(err)
        toast.error("Failed to delete transaction")
      })
  }

  return (
    <div>
      <div className="mt-6 space-y-4">
        {transactions.map((tx, i) => {
          const product = products.find((p) => p.uid === tx.productId)
          return (
            <Card key={`${tx.uid} ~ ${i}`}>
              <CardHeader className="flex justify-between items-center border-b">
                <CardTitle className="">Transaction</CardTitle>
                <p className="text-xs text-muted-foreground">
                  #{tx.uid.slice(0, 6)}
                </p>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="text-sm lg:text-base">
                  {tx.quantity} unit{tx.quantity > 1 ? "s" : ""} of{" "}
                  <span className="font-medium">
                    {product?.name ?? "Unknown Product"}
                  </span>
                </p>
                <p className="text-sm lg:text-base text-gray-500">
                  Total:{" "}
                  <span className="text-gray-950">${tx.total.toFixed(2)}</span>
                </p>
                <p className="text-sm lg:text-base text-gray-500">
                  Added by:{" "}
                  <span className="text-gray-950">
                    {tx.createdBy || "Unknown"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Verified by:{" "}
                  <span className="text-gray-950">
                    {tx.verifiedBy || "Not Verified"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Created at:{" "}
                  <span className="text-gray-950">
                    {tx.createdAt.toDate().toLocaleString()}
                  </span>
                </p>
                {tx.verified && (
                  <p className="text-xs text-emerald-400">
                    Verified at:{" "}
                    <span className="text-emerald-600">
                      {tx.verifiedAt?.toDate().toLocaleString()}
                    </span>
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {isOwner && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-red-600 mt-2.5"
                      onClick={() => {
                        setPendingDeleteId(tx.uid)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>

                    <Button
                      variant={"secondary"}
                      onClick={() => {
                        setPendingVerifyId(tx.uid)
                        setVerifyDialogOpen(true)
                      }}
                    >
                      {tx.verified ? "Verified" : "Verify"}
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingVerifyId) {
                  await handleVerify(pendingVerifyId)
                  setVerifyDialogOpen(false)
                  setPendingVerifyId(null)
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDeleteId) {
                  await handleDelete(pendingDeleteId)
                  setDeleteDialogOpen(false)
                  setPendingDeleteId(null)
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
