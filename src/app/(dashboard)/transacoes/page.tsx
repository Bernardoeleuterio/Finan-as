import { getTransactionsData } from "./actions";
import { TransactionsClient } from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { transactions, categories, debts } = await getTransactionsData();

  return (
    <TransactionsClient
      initialTransactions={transactions}
      initialCategories={categories}
      initialDebts={debts}
    />
  );
}
