import TransactionBuilder from "@/components/transactions/TransactionBuilder";
import TransactionList from "@/components/transactions/TransactionList";
import { useAppContext } from "@/hook/useAppContext";

export default function Transaction() {
  const { profileLoading } = useAppContext();

  if (profileLoading) return <p>Loading...</p>;

  return (
    <div className="py-6 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
      <TransactionBuilder />
      <TransactionList />
    </div>
  );
}
