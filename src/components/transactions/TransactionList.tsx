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
} from "../ui/alert-dialog";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Spinner } from "../ui/spinner";
import { supabase } from "@/lib/supabaseClient";
import { useTransactions } from "@/queries/useTransactions";
import { useProfile } from "@/queries/useProfile";

export default function TransactionList() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [pendingVerifyId, setPendingVerifyId] = useState<string | null>(null);

  const { data: profile } = useProfile();
  const businessId = profile?.business_id;
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions(businessId ?? "");
  console.log({ transactions });

  const handleVerify = async (transactionId: string) => {
    if (profile?.role !== "owner") return;

    const { error } = await supabase
      .from("transactions")
      .update({
        verified: true,
      })
      .eq("id", transactionId);

    if (error) {
      toast.error("Failed to verify transaction");
      throw error;
    }
    toast.success("Transaction verified");
  };

  const handleDelete = async (transactionId: string) => {
    if (profile?.role !== "owner") return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);
    if (error) {
      toast.error("Failed to delete transaction");
      throw error;
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
          {transactions?.length === 0 && (
            <p className="text-center text-muted-foreground text-sm">
              No transactions availabe yet : |
            </p>
          )}
          {transactions?.map((tx, i) => {
            return (
              <Card
                className="rounded shadow-none border"
                key={`${tx.id} ~ ${i}`}
              >
                <CardHeader className="flex justify-between items-center border-b">
                  <CardTitle className="">Transaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Items */}
                  <div className="space-y-2">
                    {tx.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm border-b pb-1"
                      >
                        <span>
                          {item.quantity} ×{" "}
                          {item.products?.name ?? "Unknown Product"}
                        </span>
                        <span>
                          ₦{(item.quantity * item.unit_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between font-semibold pt-2">
                    <span>Total</span>
                    <span>
                      ₦
                      {tx.items
                        .reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  {/* Meta */}
                  <p className="text-sm flex">
                    <span className="text-muted-foreground w-24">
                      Added by:
                    </span>
                    {tx.created_by_email?.email ?? "Unknown"}
                  </p>

                  <p className="text-sm flex">
                    <span className="text-muted-foreground w-24">
                      Created at:
                    </span>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>

                  <p className="text-sm flex">
                    <span className="text-muted-foreground w-24">
                      Verified:
                    </span>
                    {tx.verified ? (
                      <span className="text-green-500">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between">
                  {profile?.role === "owner" && (
                    <>
                      <Button
                        size="sm"
                        variant={"secondary"}
                        className="rounded cursor-pointer hover:bg-primary-300 hover:text-white transition-colors"
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
                        className="rounded  hover:bg-primary-400 hover:text-white transition-colors"
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
