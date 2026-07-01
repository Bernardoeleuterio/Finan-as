"use client";

import React from "react";
import { Edit2 } from "lucide-react";

interface SummaryCardsProps {
  currentBalance: number;
  monthlyIncomeTotal: number;
  monthlyExpenseTotal: number;
  monthlySavingGoal: number | null;
  financialGoal: string | null;
  monthlyIncomeConfig: number;
  onEditBalance: () => void;
}

export function SummaryCards({
  currentBalance,
  monthlyIncomeTotal,
  monthlyExpenseTotal,
  monthlySavingGoal,
  financialGoal,
  monthlyIncomeConfig,
  onEditBalance,
}: SummaryCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Saldo Atual */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-550/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Caixa</span>
          <button
            onClick={onEditBalance}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition no-print cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
          {formatCurrency(currentBalance)}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate">
          Meta: {financialGoal || "Nenhum objetivo definido"}
        </p>
      </div>

      {/* Card 2: Receitas do Mês */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-550/5 rounded-full blur-2xl pointer-events-none" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Entradas (Mês)</span>
        <p className="text-2xl font-extrabold text-blue-400 tracking-tight">
          {formatCurrency(monthlyIncomeTotal)}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
          Renda Fixa Prevista: {formatCurrency(monthlyIncomeConfig)}
        </p>
      </div>

      {/* Card 3: Despesas do Mês */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-550/5 rounded-full blur-2xl pointer-events-none" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Saídas (Mês)</span>
        <p className="text-2xl font-extrabold text-slate-200 tracking-tight">
          {formatCurrency(monthlyExpenseTotal)}
        </p>
        <p className="text-[10px] text-rose-400 mt-1 font-semibold">
          {monthlyIncomeConfig > 0
            ? `${Math.round((monthlyExpenseTotal / monthlyIncomeConfig) * 100)}% da renda prevista`
            : "Defina sua renda no perfil"}
        </p>
      </div>

      {/* Card 4: Meta Mensal */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-550/5 rounded-full blur-2xl pointer-events-none" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Meta de Poupança</span>
        <p className="text-2xl font-extrabold text-amber-400 tracking-tight">
          {monthlySavingGoal ? formatCurrency(monthlySavingGoal) : "A definir"}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
          Economia Prevista: {formatCurrency(Math.max(monthlyIncomeConfig - monthlyExpenseTotal, 0))}
        </p>
      </div>
    </div>
  );
}
