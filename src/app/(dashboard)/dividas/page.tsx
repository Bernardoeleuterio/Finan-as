import { getDebtsData } from "./actions";
import { DebtsClient } from "./DebtsClient";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const { debts, transactions } = await getDebtsData();

  return (
    <DebtsClient
      initialDebts={debts}
      initialTransactions={transactions}
    />
  );
}
