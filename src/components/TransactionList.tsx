import { useEffect, useState } from "react"
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
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

export default function TransactionList({
  businessId,
  isOwner,
  products,
}: {
  businessId: string
  isOwner: boolean
  products: ProductProps[]
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

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
            <div
              key={`${tx.uid} ~ ${i}`}
              className="border p-6 rounded-lg space-y-2.5 shadow-sm"
            >
              <p className="text-sm lg:text-base">
                {tx.quantity} unit{tx.quantity > 1 ? "s" : ""} of{" "}
                <span className="font-medium">
                  {product?.name ?? "Unknown Product"}
                </span>{" "}
                — Total: ₦{tx.total?.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500">
                Added by: {tx.createdBy || "Unknown"}
              </p>
              {isOwner && (
                <Button
                  variant="outline"
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
              )}
            </div>
          )
        })}
      </div>
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
