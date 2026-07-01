"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ReceiptText, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { NewTransactionModal } from "@/components/dashboard/NewTransactionModal";
import {
  saveTransactionAction,
  deleteTransactionAction,
  createCategoryAction,
} from "./actions";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Debt {
  id: string;
  creditor: string;
  debtType: string;
}

interface Transaction {
  id: string;
  description: string;
  type: string;
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  categoryId: string | null;
  category: Category | null;
  debtId: string | null;
  debt: { creditor: string } | null;
}

interface TransactionsClientProps {
  initialTransactions: Transaction[];
  initialCategories: Category[];
  initialDebts: Debt[];
}

export function TransactionsClient({
  initialTransactions,
  initialCategories,
  initialDebts,
}: TransactionsClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Formatar Dinheiro
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Calcular resumos com base em TODAS as transações
  const totalIncome = initialTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = initialTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSave = async (data: Parameters<typeof saveTransactionAction>[0]) => {
    await saveTransactionAction(data);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = async (tx: Transaction) => {
    if (!confirm(`Deseja excluir a transação "${tx.description}"? O saldo local será ajustado.`)) return;
    await deleteTransactionAction(tx.id);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleCreateCategory = async (name: string, type: "income" | "expense" | "both") => {
    const newCat = await createCategoryAction(name, type);
    startTransition(() => {
      router.refresh();
    });
    return newCat;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            <ReceiptText className="w-8 h-8 text-emerald-400" />
            Transações
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Registre suas receitas e despesas e acompanhe os seus lançamentos locais.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Entradas */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-550/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Receitas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        {/* Saídas */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-550/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Despesas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-200 tracking-tight">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-550/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fluxo Mensal</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold tracking-tight ${totalIncome - totalExpense >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* List */}
      <TransactionsList
        transactions={initialTransactions}
        categories={initialCategories}
        onDelete={handleDelete}
        onEdit={(tx) => {
          setEditingTransaction(tx);
          setIsModalOpen(true);
        }}
      />

      {/* Modal */}
      {isModalOpen && (
        <NewTransactionModal
          categories={initialCategories}
          debts={initialDebts}
          initialTransaction={editingTransaction}
          onClose={() => {
            setEditingTransaction(null);
            setIsModalOpen(false);
          }}
          onSave={handleSave}
          onCreateCategory={handleCreateCategory}
        />
      )}
    </div>
  );
}
