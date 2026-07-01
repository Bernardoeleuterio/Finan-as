"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Goal,
  Edit2,
  FileDown,
  CircleDollarSign,
  TrendingUp,
  Receipt,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Edit Balance Modal State
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(profile.currentBalance.toString());
  const [balanceError, setBalanceError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 1. Calcular Totais Reais dos Lançamentos do Mês Corrente
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

  // 2. Montar dados para o gráfico de barras mensal (Fluxo de Caixa)
  const monthlyChartData = [
    {
      name: devDate.toLocaleDateString("pt-BR", { month: "long" }),
      Receitas: monthlyIncomeTotal,
      Despesas: monthlyExpenseTotal,
    },
  ];

  // 3. Montar dados para o gráfico de pizza por categoria
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

  // 4. Salvar saldo manual
  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(newBalance);
    if (isNaN(balanceNum)) {
      setBalanceError("Por favor, digite um valor válido.");
      return;
    }
    setBalanceError("");
    await updateBalanceAction(balanceNum);
    startTransition(() => {
      router.refresh();
    });
    setIsEditBalanceOpen(false);
  };

  // 5. Acionar Exportação PDF (window.print)
  const handlePrintPDF = () => {
    window.print();
  };

  // 6. Meta de Economia
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
          onClick={handlePrintPDF}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition cursor-pointer"
        >
          <FileDown className="w-4.5 h-4.5" />
          Exportar Relatório PDF
        </button>
      </div>

      {/* Título de Impressão (Apenas visível ao imprimir PDF) */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Relatório Financeiro Pessoal - FinTrack</h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerado em: {new Date().toLocaleDateString("pt-BR")} | Usuário: {profile.fullName}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Saldo Atual */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-550/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Caixa</span>
            <button
              onClick={() => {
                setNewBalance(profile.currentBalance.toString());
                setIsEditBalanceOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition no-print cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {formatCurrency(profile.currentBalance)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate">
            Meta: {profile.financialGoal || "Nenhum objetivo definido"}
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
            Renda Fixa Prevista: {formatCurrency(profile.monthlyIncome)}
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
            {profile.monthlyIncome > 0
              ? `${Math.round((monthlyExpenseTotal / profile.monthlyIncome) * 100)}% da renda prevista`
              : "Defina sua renda no perfil"}
          </p>
        </div>

        {/* Card 4: Meta Mensal */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-550/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Meta de Poupança</span>
          <p className="text-2xl font-extrabold text-amber-400 tracking-tight">
            {profile.monthlySavingGoal ? formatCurrency(profile.monthlySavingGoal) : "A definir"}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">
            Economia Prevista: {formatCurrency(Math.max(profile.monthlyIncome - monthlyExpenseTotal, 0))}
          </p>
        </div>
      </div>

      {/* Gráficos e Visualizações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Fluxo de Caixa */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 shadow-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Fluxo de Caixa (Este Mês)
          </h2>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1423",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Carregando gráfico...
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Despesas por Categoria */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 shadow-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Despesas por Categoria (Este Mês)
          </h2>
          <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            {mounted ? (
              categoryChartData.length > 0 ? (
                <>
                  <div className="h-full flex-1 w-full max-w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => formatCurrency(Number(value))}
                          contentStyle={{
                            backgroundColor: "#0f1423",
                            borderColor: "#1e293b",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legendas */}
                  <div className="space-y-1.5 flex-1 max-h-[180px] overflow-y-auto w-full">
                    {categoryChartData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-slate-300 font-medium truncate max-w-[120px]">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-white font-bold">{formatCurrency(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Nenhuma despesa registrada neste mês.
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Carregando gráfico...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recentes & Progresso da Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recentes (Left 2 cols) */}
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

        {/* Progresso de Metas (Right 1 col) */}
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
                {/* Progress bar */}
                <div className="h-2.5 w-full bg-slate-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-350"
                    style={{ width: `${boundedProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Baseado na economia líquida atual do mês (Entradas - Saídas) em relação à sua meta mensal de poupança de{" "}
                  <strong className="text-slate-400">{formatCurrency(profile.monthlySavingGoal)}</strong>.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-400 leading-normal">
                  Defina um valor de meta mensal nas configurações de perfil para acompanhar a evolução do seu caixa.
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
                "{profile.financialGoal}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Balance Modal */}
      {isEditBalanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm" onClick={() => setIsEditBalanceOpen(false)} />
          <div className="w-full max-w-sm bg-[#0f1423] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                  Ajustar Saldo
                </h2>
                <p className="text-xs text-slate-400 mt-1">Altere o saldo atual em caixa diretamente.</p>
              </div>
              <button
                onClick={() => setIsEditBalanceOpen(false)}
                className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="p-6 space-y-4">
              {balanceError && <p className="text-xs text-rose-400">{balanceError}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Novo Saldo (R$)</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  step="0.01"
                  required
                  placeholder="0,00"
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditBalanceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-350 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
