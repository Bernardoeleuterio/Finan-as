"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  WalletCards,
  Calendar,
  CreditCard,
  Receipt,
  Eye,
  Edit2,
  Check,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { NewDebtModal } from "@/components/debts/NewDebtModal";
import { DebtDetailsModal } from "@/components/debts/DebtDetailsModal";
import {
  saveDebtAction,
  deleteDebtAction,
  payDebtInstallmentAction,
} from "./actions";

interface Transaction {
  id: string;
  description: string;
  type: string;
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  categoryId: string | null;
  category: { name: string } | null;
  debtId: string | null;
}

interface Debt {
  id: string;
  debtType: string;
  creditor: string;
  description: string | null;
  totalAmount: number | null;
  installmentAmount: number | null;
  totalInstallments: number | null;
  paidInstallments: number | null;
  dueDay: number;
  nextDueDate: Date | string | null;
  openingInvoiceAmount: number | null;
  openingInvoiceMonth: string | null;
  notes: string | null;
  status: string;
}

interface DebtsClientProps {
  initialDebts: Debt[];
  initialTransactions: Transaction[];
}

// Helpers para cálculo de parcelas devidas no mês selecionado
function monthDifference(startMonth: string, targetMonth: string) {
  const [startYear, startVal] = startMonth.split("-").map(Number);
  const [targetYear, targetVal] = targetMonth.split("-").map(Number);
  return (targetYear - startYear) * 12 + targetVal - startVal;
}

function isInstallmentDueInMonth(debt: Debt, selectedMonth: string) {
  if (
    debt.debtType !== "installment" ||
    debt.status === "paid" ||
    !debt.nextDueDate ||
    debt.totalInstallments === null ||
    debt.paidInstallments === null
  ) {
    return false;
  }

  const remaining = debt.totalInstallments - debt.paidInstallments;
  const dateStr = typeof debt.nextDueDate === "string" ? debt.nextDueDate : debt.nextDueDate.toISOString();
  const startMonthStr = dateStr.slice(0, 7); // YYYY-MM
  const difference = monthDifference(startMonthStr, selectedMonth);

  return difference >= 0 && difference < remaining;
}

export function DebtsClient({ initialDebts, initialTransactions }: DebtsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados locais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [debtTypeFilter, setDebtTypeFilter] = useState<"all" | "installment" | "credit_card">("all");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Buscar transações vinculadas à fatura de um cartão no mês selecionado
  const getInvoiceTransactions = (debtId: string) => {
    return initialTransactions.filter((tx) => {
      if (tx.debtId !== debtId || tx.type !== "expense") return false;
      const dateObj = typeof tx.transactionDate === "string" ? new Date(tx.transactionDate) : tx.transactionDate;
      const yearMonth = dateObj.toISOString().slice(0, 7);
      return yearMonth === selectedMonth;
    });
  };

  // Buscar total da fatura
  const getInvoiceTotal = (debtId: string) => {
    const debt = initialDebts.find((item) => item.id === debtId);
    if (!debt) return 0;

    const openingAmount =
      debt.openingInvoiceMonth?.slice(0, 7) === selectedMonth
        ? debt.openingInvoiceAmount ?? 0
        : 0;

    const txsSum = getInvoiceTransactions(debtId).reduce((sum, t) => sum + t.amount, 0);
    return openingAmount + txsSum;
  };

  // Salvar Dívida
  const handleSaveDebt = async (data: any) => {
    await saveDebtAction(data);
    startTransition(() => {
      router.refresh();
    });
  };

  // Excluir Dívida
  const handleDeleteDebt = async (id: string) => {
    if (!confirm("Deseja realmente excluir este compromisso? Compras vinculadas a cartões continuarão existindo.")) return;
    await deleteDebtAction(id);
    startTransition(() => {
      router.refresh();
    });
  };

  // Pagar Parcela de Dívida
  const handlePayInstallment = async (debtId: string) => {
    await payDebtInstallmentAction(debtId);
    startTransition(() => {
      router.refresh();
    });
  };

  // Filtrar Dívidas
  const visibleDebts = initialDebts.filter((debt) => {
    // Filtrar por tipo (Dívida / Cartão)
    const matchesType = debtTypeFilter === "all" || debt.debtType === debtTypeFilter;
    
    // Filtrar por vencimento do mês
    // Cartões aparecem sempre no painel (pois a fatura fecha todo mês)
    // Parcelamentos aparecem apenas se vencerem no mês selecionado
    const matchesMonth =
      debt.debtType === "credit_card" || isInstallmentDueInMonth(debt, selectedMonth);

    return matchesType && matchesMonth;
  });

  // Métricas do Mês Selecionado
  const monthlyCommitment = visibleDebts.reduce((total, debt) => {
    if (debt.debtType === "credit_card") {
      return total + getInvoiceTotal(debt.id);
    }
    return total + (debt.installmentAmount ?? 0);
  }, 0);

  // Saldo total de dívidas ativas restantes (a pagar no futuro)
  const totalDebtRemaining = initialDebts
    .filter((debt) => debt.debtType === "installment" && debt.status !== "paid")
    .reduce((total, debt) => {
      const remaining = (debt.totalInstallments ?? 0) - (debt.paidInstallments ?? 0);
      return total + (debt.installmentAmount ?? 0) * remaining;
    }, 0);

  // Mês legível
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedMonth}-02`)); // -02 evita bugs de fuso horário no dia 01

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            <WalletCards className="w-8 h-8 text-emerald-400" />
            Dívidas & Faturas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Planeje seus pagamentos, acompanhe faturas de cartão e pague parcelamentos de forma local.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDebt(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Adicionar Cartão / Dívida
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Restante de Dívidas */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-550/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Total Restante a Pagar</span>
          <p className="text-2xl font-extrabold text-amber-400 tracking-tight">
            {formatCurrency(totalDebtRemaining)}
          </p>
        </div>

        {/* Compromissos do Mês */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-550/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">A Pagar em {monthLabel}</span>
          <p className="text-2xl font-extrabold text-slate-200 tracking-tight">
            {formatCurrency(monthlyCommitment)}
          </p>
        </div>

        {/* Quantidade de Compromissos */}
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-550/5 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Compromissos no Mês</span>
          <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {visibleDebts.length}
          </p>
        </div>
      </div>

      {/* Control Panel (Filters and Month selector) */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Segmented Filter */}
        <div className="flex bg-[#161e33] p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { label: "Todos", value: "all" },
            { label: "Dívidas", value: "installment" },
            { label: "Cartões", value: "credit_card" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDebtTypeFilter(option.value as any)}
              className={`flex-1 sm:flex-none text-xs font-bold py-2 px-4 rounded-lg transition cursor-pointer ${
                debtTypeFilter === option.value
                  ? "bg-slate-800 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Vencimentos em:
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#161e33] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Debts Grid Cards */}
      {visibleDebts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleDebts.map((debt) => {
            const isCard = debt.debtType === "credit_card";
            const remainingInstallments =
              debt.totalInstallments !== null && debt.paidInstallments !== null
                ? debt.totalInstallments - debt.paidInstallments
                : 0;

            const progressPercent =
              debt.totalInstallments && debt.paidInstallments !== null
                ? Math.round((debt.paidInstallments / debt.totalInstallments) * 100)
                : 0;

            const displayedAmount = isCard ? getInvoiceTotal(debt.id) : debt.installmentAmount ?? 0;

            return (
              <article
                key={debt.id}
                className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 shadow-md hover:border-slate-700 transition flex flex-col justify-between space-y-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{debt.creditor}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isCard ? "Cartão de Crédito" : debt.description || "Sem descrição"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isCard
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : debt.status === "paid"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {isCard ? "Fatura" : debt.status === "paid" ? "Quitado" : "Parcelamento"}
                  </span>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                    {isCard ? "Total Fatura Atual" : "Valor da Parcela"}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-extrabold text-white tracking-tight">
                      {formatCurrency(displayedAmount)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {isCard ? `vence dia ${debt.dueDay}` : "este mês"}
                    </span>
                  </div>
                </div>

                {isCard ? (
                  /* Detalhes de Fatura Cartão */
                  <div className="flex justify-between text-xs text-slate-400 pt-3 border-t border-slate-850">
                    <span>{getInvoiceTransactions(debt.id).length} compras lançadas</span>
                    <span className="font-semibold">{monthLabel}</span>
                  </div>
                ) : (
                  /* Detalhes de Parcelas */
                  <div className="space-y-2.5 pt-3 border-t border-slate-850">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{remainingInstallments} parcelas restantes</span>
                      <span className="text-slate-300 font-bold">{progressPercent}% pago</span>
                    </div>
                    {/* Barra de Progresso */}
                    <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setSelectedDebt(debt)}
                    className="flex-1 sm:flex-none text-center py-2 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition cursor-pointer"
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => {
                      setEditingDebt(debt);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none text-center py-2 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition cursor-pointer"
                  >
                    Editar
                  </button>
                  {!isCard && debt.status !== "paid" && (
                    <button
                      onClick={() => handlePayInstallment(debt.id)}
                      className="col-span-2 sm:col-span-none flex-1 sm:flex-none text-center py-2 px-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-550/25 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Pagar Parcela
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="col-span-2 sm:col-span-none sm:ml-auto text-center py-2 px-3.5 text-rose-400 hover:text-white hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-550/20 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-sm">
          Nenhum compromisso financeiro cadastrado ou vencendo no mês de {monthLabel}.
        </div>
      )}

      {/* Modal Nova Dívida */}
      {isModalOpen && (
        <NewDebtModal
          initialDebt={editingDebt}
          onClose={() => {
            setEditingDebt(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveDebt}
        />
      )}

      {/* Modal Detalhes Dívida */}
      {selectedDebt && (
        <DebtDetailsModal
          debt={selectedDebt}
          invoiceTransactions={getInvoiceTransactions(selectedDebt.id)}
          monthLabel={monthLabel}
          selectedMonth={selectedMonth}
          onClose={() => setSelectedDebt(null)}
        />
      )}
    </div>
  );
}
