"use client";

import React from "react";
import { X, Landmark, FileText } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  type: string;
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  categoryId: string | null;
  category: { name: string } | null;
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

interface DebtDetailsModalProps {
  debt: Debt;
  invoiceTransactions: Transaction[];
  monthLabel: string;
  selectedMonth: string;
  onClose: () => void;
}

export function DebtDetailsModal({
  debt,
  invoiceTransactions,
  monthLabel,
  selectedMonth,
  onClose,
}: DebtDetailsModalProps) {
  const isCard = debt.debtType === "credit_card";

  const formatCurrency = (val: number | null) => {
    if (val === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formatDate = (dateVal: Date | string | null) => {
    if (!dateVal) return "N/A";
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  };

  // Calcular total da fatura
  const openingAmount =
    debt.openingInvoiceMonth?.slice(0, 7) === selectedMonth
      ? debt.openingInvoiceAmount ?? 0
      : 0;

  const transactionsTotal = invoiceTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const invoiceTotal = openingAmount + transactionsTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="w-full max-w-lg bg-[#0f1423] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-scale-up">
        {/* Banner */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${isCard ? "from-blue-500 to-indigo-400" : "from-amber-500 to-orange-400"}`} />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Landmark className={`w-5 h-5 ${isCard ? "text-blue-400" : "text-amber-400"}`} />
              Detalhes do Compromisso
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Informações consolidadas para {debt.creditor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Card de Resumo Rápido */}
          <div className="bg-[#161e33]/50 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {isCard ? `Fatura de ${monthLabel}` : "Valor da Parcela"}
              </p>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {isCard ? formatCurrency(invoiceTotal) : formatCurrency(debt.installmentAmount)}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                debt.status === "paid"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              }`}>
                {debt.status === "paid" ? "Quitada" : "Ativa"}
              </span>
            </div>
          </div>

          {/* Seção de Dados Específicos */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#161e33]/30 p-3.5 border border-slate-800/60 rounded-2xl">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Credor</span>
              <span className="text-white font-semibold">{debt.creditor}</span>
            </div>
            <div className="bg-[#161e33]/30 p-3.5 border border-slate-800/60 rounded-2xl">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Dia de Vencimento</span>
              <span className="text-white font-semibold">Dia {debt.dueDay}</span>
            </div>

            {!isCard ? (
              <>
                <div className="bg-[#161e33]/30 p-3.5 border border-slate-800/60 rounded-2xl col-span-2 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Progresso das Parcelas</span>
                    <span className="text-white font-semibold">
                      {debt.paidInstallments} de {debt.totalInstallments} pagas
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                    {debt.totalInstallments && debt.paidInstallments !== null
                      ? Math.round((debt.paidInstallments / debt.totalInstallments) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="bg-[#161e33]/30 p-3.5 border border-slate-800/60 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Total da Dívida</span>
                  <span className="text-white font-semibold">{formatCurrency(debt.totalAmount)}</span>
                </div>
                <div className="bg-[#161e33]/30 p-3.5 border border-slate-800/60 rounded-2xl">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Próximo Vencimento</span>
                  <span className="text-white font-semibold">{formatDate(debt.nextDueDate)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-[#161e33]/30 p-3.5 border border-slate-800/60 rounded-2xl col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Saldo Inicial ({debt.openingInvoiceMonth})</span>
                    <span className="text-white font-semibold">{formatCurrency(debt.openingInvoiceAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Compras do Mês ({monthLabel})</span>
                    <span className="text-white font-semibold">{formatCurrency(transactionsTotal)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Seção de Compras do Cartão */}
          {isCard && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Compras lançadas no cartão ({invoiceTransactions.length})
              </h4>
              <div className="bg-[#161e33]/30 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
                {invoiceTransactions.length > 0 ? (
                  invoiceTransactions.map((t) => (
                    <div key={t.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-white">{t.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {t.category?.name || "Sem categoria"} • {formatDate(t.transactionDate)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-200">
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    Nenhuma compra lançada neste cartão para o mês de {monthLabel}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas */}
          {debt.notes && (
            <div className="bg-[#161e33]/20 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notas</span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{debt.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
