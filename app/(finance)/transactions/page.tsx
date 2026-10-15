import { PageHeader } from "@/components/page-header";
import { TransactionManager } from "@/components/transaction-manager";
import { getFinanceData } from "@/lib/finance-data";

export default async function TransactionsPage() {
  const data = await getFinanceData(new Date().toISOString().slice(0, 7));
  if (!data) return null;
  return (
    <>
      <PageHeader title="Transactions" description="Add, search, filter, edit, and export your expenses. Each transaction belongs to your signed-in account." />
      <TransactionManager transactions={data.allTransactions} />
    </>
  );
}
