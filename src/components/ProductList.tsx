"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ProductProps } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
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

export default function ProductList({
  businessId,
  isOwner,
}: {
  businessId: string
  isOwner: boolean
}) {
  const [products, setProducts] = useState<ProductProps[]>([])
  const [editing, setEditing] = useState<{
    [key: string]: Partial<ProductProps>
  }>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!businessId) return

    const unsubscribe = onSnapshot(
      collection(db, "businesses", businessId, "products"),
      (snap) => {
        const list = snap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as ProductProps[]
        setProducts(list)
      }
    )

    return () => unsubscribe()
  }, [businessId])

  const handleEdit = async (id: string) => {
    const changes = editing[id]
    if (!changes) return

    await updateDoc(doc(db, "businesses", businessId, "products", id), changes)
    setEditing((prev) => ({ ...prev, [id]: {} }))
    toast.success("Changes Saved!")
    setIsEditing(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "businesses", businessId, "products", id))
    } catch (error) {
      console.error("~ Delete error:", error)
      toast.error("delete failed.")
    }
  }

  return (
    <div className="grid gap-4 mt-8 w-full max-w-lg md:max-w-xl lg:max-w-2xl">
      {products.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm">
          No products availabe yet : (
        </p>
      ) : (
        products.map((product) => (
          <div key={product.uid} className="">
            {isOwner ? (
              <>
                <Card>
                  <CardHeader>
                    <p className="text-gray-600 text-end text-xs">
                      SKU: {product.sku}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {isEditing ? (
                      <>
                        <Input
                          className="text-sm"
                          defaultValue={product.name}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [product.uid]: {
                                ...prev[product.uid],
                                name: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          className="text-sm"
                          defaultValue={product.price}
                          type="number"
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [product.uid]: {
                                ...prev[product.uid],
                                price: Number(e.target.value),
                              },
                            }))
                          }
                        />
                        <Input
                          className="text-sm"
                          defaultValue={product.stock}
                          type="number"
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [product.uid]: {
                                ...prev[product.uid],
                                stock: Number(e.target.value),
                              },
                            }))
                          }
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-sm px-3 py-1.5 border rounded-sm">
                          {product.name}
                        </p>
                        <p className="text-sm px-3 py-1.5 border rounded-sm">
                          {product.price}
                        </p>
                        <p className="text-sm px-3 py-1.5 border rounded-sm">
                          {product.stock}
                        </p>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between">
                    {isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPendingSaveId(product.uid)
                          setEditDialogOpen(true)
                        }}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(true)
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                        }}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-rose-600"
                        onClick={() => {
                          setPendingDeleteId(product.uid)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader className="flex justify-between border-b">
                  <CardTitle className="scroll-m-20 tracking-tight">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <p className="text-sm lg:text-base">
                    Price: ₦{product.price}
                  </p>
                  <p className="text-sm lg:text-base">Stock: {product.stock}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ))
      )}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save changes to this product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingSaveId) {
                  await handleEdit(pendingSaveId)
                  setEditDialogOpen(false)
                  setPendingSaveId(null)
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
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product?
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
