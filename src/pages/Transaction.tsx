import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import { useAuth } from "@/hook/useAuth";

export default function Transaction() {
  const { profileLoading } = useAuth();

  if (profileLoading) return <p>Loading...</p>;

  return (
    <div className="py-6 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
      <AddTransaction />
      <TransactionList />
    </div>
  );
}
