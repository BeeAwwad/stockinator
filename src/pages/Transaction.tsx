import TransactionBuilder from "@/components/transactions/TransactionBuilder";
import TransactionList from "@/components/transactions/TransactionList";
import { Spinner } from "@/components/ui/spinner";
import { useProfile } from "@/queries/useProfile";
import { useTransactionsRealtime } from "@/realtime/useTransactionsRealtime";

export default function Transaction() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const businessId = profile?.business_id;

  useTransactionsRealtime(businessId);
  if (profileLoading)
    return (
      <div>
        <Spinner />
        <p>Loading Profile...</p>
      </div>
    );

  return (
    <div className="py-6 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
      <TransactionBuilder />
      <TransactionList />
    </div>
  );
}
