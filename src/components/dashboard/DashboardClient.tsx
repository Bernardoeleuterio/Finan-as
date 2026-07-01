"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileDown,
  Goal,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
} from "lucide-react";
import { SummaryCards } from "./SummaryCards";
import { MonthlyChart } from "./MonthlyChart";
import { CategoryChart } from "./CategoryChart";
import { EditBalanceModal } from "./EditBalanceModal";
import { updateBalanceAction } from "@/app/(dashboard)/actions";

interface Transaction {
  id: string;
  description: string;
  type: string;
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  category: { name: string } | null;
}

interface Profile {
  fullName: string;
  currentBalance: number;
  monthlyIncome: number;
  monthlySavingGoal: number | null;
  financialGoal: string | null;
}

interface DashboardClientProps {
  profile: Profile;
  transactions: Transaction[];
}

export function DashboardClient({ profile, transactions }: DashboardClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Edit Balance Modal State
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formatDate = (dateVal: Date | string) => {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  };

  // 1. Lançamentos do Mês Corrente
  const devDate = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const dateObj = typeof t.transactionDate === "string" ? new Date(t.transactionDate) : t.transactionDate;
    return (
      dateObj.getFullYear() === devDate.getFullYear() &&
      dateObj.getMonth() === devDate.getMonth()
    );
  });

  const monthlyIncomeTotal = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenseTotal = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Montar dados para o gráfico de despesas por categoria
  const expensesByCategory = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      const catName = t.category?.name || "Sem categoria";
      acc[catName] = (acc[catName] ?? 0) + t.amount;
      return acc;
    }, {});

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899", "#14b8a6"];
  const categoryChartData = Object.entries(expensesByCategory).map(([name, value], idx) => ({
    name,
    value,
    color: COLORS[idx % COLORS.length],
  }));

  // 3. Salvar saldo manual
  const handleUpdateBalance = async (balance: number) => {
    await updateBalanceAction(balance);
    startTransition(() => {
      router.refresh();
    });
  };

  // 4. Meta de Economia
  const progressPercent =
    profile.monthlySavingGoal && profile.monthlyIncome > 0
      ? Math.round(
          (Math.max(profile.monthlyIncome - monthlyExpenseTotal, 0) /
            profile.monthlySavingGoal) *
            100
        )
      : 0;

  const boundedProgress = Math.min(progressPercent, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Painel Financeiro
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Olá, <span className="font-semibold text-white">{profile.fullName}</span>. Veja o resumo das suas finanças neste mês.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition cursor-pointer"
        >
          <FileDown className="w-4.5 h-4.5" />
          Exportar Relatório PDF
        </button>
      </div>

      {/* Título de Impressão (Apenas no PDF) */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Relatório Financeiro Pessoal - FinTrack</h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerado em: {new Date().toLocaleDateString("pt-BR")} | Usuário: {profile.fullName}
        </p>
      </div>

      {/* Summary Cards Component */}
      <SummaryCards
        currentBalance={profile.currentBalance}
        monthlyIncomeTotal={monthlyIncomeTotal}
        monthlyExpenseTotal={monthlyExpenseTotal}
        monthlySavingGoal={profile.monthlySavingGoal}
        financialGoal={profile.financialGoal}
        monthlyIncomeConfig={profile.monthlyIncome}
        onEditBalance={() => setIsEditBalanceOpen(true)}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart
          monthName={devDate.toLocaleDateString("pt-BR", { month: "long" })}
          income={monthlyIncomeTotal}
          expense={monthlyExpenseTotal}
        />
        <CategoryChart data={categoryChartData} />
      </div>

      {/* Recentes & Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recentes */}
        <div className="lg:col-span-2 bg-[#0f1423] border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Lançamentos Recentes
            </h2>
            <button
              onClick={() => router.push("/transacoes")}
              className="text-xs text-emerald-400 font-semibold hover:underline no-print cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      tx.type === "income"
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {tx.category?.name || "Sem categoria"} • {formatDate(tx.transactionDate)}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${tx.type === "income" ? "text-emerald-400" : "text-slate-200"}`}>
                  {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-xs">
                Nenhuma transação cadastrada ainda.
              </div>
            )}
          </div>
        </div>

        {/* Metas */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Goal className="w-4 h-4 text-amber-400" />
              Meta de Poupança
            </h2>

            {profile.monthlySavingGoal ? (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progresso Economizado</span>
                  <span className="text-white font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-350"
                    style={{ width: `${boundedProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Baseado na economia líquida atual do mês em relação à sua meta mensal de poupança de{" "}
                  <strong className="text-slate-400">{formatCurrency(profile.monthlySavingGoal)}</strong>.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-400 leading-normal">
                  Defina uma meta mensal de poupança no seu Perfil para ver a evolução.
                </p>
              </div>
            )}
          </div>

          {profile.financialGoal && (
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                Objetivo de Longo Prazo
              </span>
              <p className="text-xs text-slate-350 italic font-medium leading-relaxed">
                &ldquo;{profile.financialGoal}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Balance Modal */}
      {isEditBalanceOpen && (
        <EditBalanceModal
          currentBalance={profile.currentBalance}
          onClose={() => setIsEditBalanceOpen(false)}
          onSave={handleUpdateBalance}
        />
      )}
    </div>
  );
}
