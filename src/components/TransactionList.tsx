import { Activity, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Spinner } from "./ui/spinner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hook/useAuth";

export default function TransactionList() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [pendingVerifyId, setPendingVerifyId] = useState<string | null>(null);

  const {
    transactions,
    setTransactions,
    transactionsLoading,
    profile,
    products,
  } = useAuth();

  const handleVerify = async (transactionId: string) => {
    if (profile?.role !== "owner") return;
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId ? { ...tx, verified: true } : tx
      )
    );
    const { error } = await supabase
      .from("transactions")
      .update({
        verified: true,
      })
      .eq("id", transactionId);
    console.log("after verifying...");
    if (error) {
      console.error(error);
      toast.error("Failed to verify transaction");
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId ? { ...tx, verified: false } : tx
        )
      );
      return;
    }
    toast.success("Transaction verified");
  };

  const handleDelete = async (transactionId: string) => {
    if (profile?.role !== "owner") return;
    const deletedTx = transactions.find((t) => t.id === transactionId);
    setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);
    if (error) {
      console.error("Failed to delete transaction");
      toast.error("Failed to delete transaction");

      if (deletedTx) {
        setTransactions((prev) => [...prev, deletedTx]);
      }
      return;
    }

    toast.success("Transaction deleted");
  };
  return (
    <>
      <Activity mode={transactionsLoading ? "visible" : "hidden"}>
        <Spinner className="mx-auto my-5" />
      </Activity>
      <Activity mode={transactionsLoading ? "hidden" : "visible"}>
        <div className="my-6 space-y-4">
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground text-sm">
              No transactions availabe yet : |
            </p>
          )}
          {transactions.map((tx, i) => {
            const product = products.find((p) => p.id === tx.product_id);
            return (
              <Card key={`${tx.id} ~ ${i}`}>
                <CardHeader className="flex justify-between items-center border-b">
                  <CardTitle className="">Transaction</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {tx?.is_offline ? "offline" : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <p className="text-sm lg:text-base flex">
                    <span className="text-muted-foreground w-20 mr-1">
                      Quantity:{" "}
                    </span>
                    {tx.amount} unit{tx.amount > 1 ? "s" : ""} of
                    <span className="ml-1">
                      {product?.name ?? " Unknown Product"}
                    </span>
                  </p>
                  <p className="text-sm lg:text-base flex">
                    <span className="text-muted-foreground w-20 mr-1">
                      Total:{" "}
                    </span>
                    <span>
                      {product
                        ? `₦${(tx.amount * product.price).toFixed(2)}`
                        : "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm lg:text-base flex">
                    <span className="text-muted-foreground w-20 mr-1">
                      Added by:{" "}
                    </span>
                    <span className="text-gray-950">
                      {tx.created_by_email?.email || "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm flex">
                    <span className="text-muted-foreground w-20  mr-1">
                      Created at:{" "}
                    </span>
                    <span className="text-gray-950">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </p>
                  {tx.verified === true ? (
                    <p className="text-sm flex text-emerald-500">verified</p>
                  ) : (
                    <p>not verified</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {profile?.role === "owner" && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-red-600 mt-2.5"
                        onClick={() => {
                          setPendingDeleteId(tx.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>

                      <Button
                        variant={"secondary"}
                        disabled={tx.verified}
                        onClick={() => {
                          setPendingVerifyId(tx.id);
                          setVerifyDialogOpen(true);
                        }}
                      >
                        {tx.verified ? "Verified" : "Verify"}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
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
                    await handleVerify(pendingVerifyId);
                    setVerifyDialogOpen(false);
                    setPendingVerifyId(null);
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
                    await handleDelete(pendingDeleteId);
                    setDeleteDialogOpen(false);
                    setPendingDeleteId(null);
                  }
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Activity>
    </>
  );
}
