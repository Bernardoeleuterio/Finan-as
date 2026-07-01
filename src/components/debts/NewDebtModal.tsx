"use client";

import React, { useState } from "react";
import { X, Sparkles, CreditCard, Receipt } from "lucide-react";

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
}

interface NewDebtModalProps {
  initialDebt?: Debt | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    debtType: string;
    creditor: string;
    description?: string;
    totalAmount?: number;
    installmentAmount?: number;
    totalInstallments?: number;
    paidInstallments?: number;
    dueDay: number;
    nextDueDate?: string;
    openingInvoiceAmount?: number;
    openingInvoiceMonth?: string;
    notes?: string;
  }) => Promise<void>;
}

export function NewDebtModal({ initialDebt, onClose, onSave }: NewDebtModalProps) {
  const isEditing = Boolean(initialDebt);
  
  const [debtType, setDebtType] = useState<string>(
    initialDebt?.debtType ?? "installment"
  );
  const [creditor, setCreditor] = useState(initialDebt?.creditor ?? "");
  const [description, setDescription] = useState(initialDebt?.description ?? "");
  const [totalAmount, setTotalAmount] = useState(initialDebt?.totalAmount?.toString() ?? "");
  const [installmentAmount, setInstallmentAmount] = useState(
    initialDebt?.installmentAmount?.toString() ?? ""
  );
  const [totalInstallments, setTotalInstallments] = useState(
    initialDebt?.totalInstallments?.toString() ?? ""
  );
  const [paidInstallments, setPaidInstallments] = useState(
    initialDebt?.paidInstallments?.toString() ?? "0"
  );
  const [dueDay, setDueDay] = useState(initialDebt?.dueDay?.toString() ?? "10");
  
  // Format Date for Input Value
  const formatDateForInput = (dateVal: Date | string | null | undefined) => {
    if (!dateVal) return new Date().toISOString().slice(0, 10);
    const dateObj = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return dateObj.toISOString().slice(0, 10);
  };
  const [nextDueDate, setNextDueDate] = useState<string>(
    formatDateForInput(initialDebt?.nextDueDate)
  );

  const [openingInvoiceAmount, setOpeningInvoiceAmount] = useState(
    initialDebt?.openingInvoiceAmount?.toString() ?? ""
  );
  const [openingInvoiceMonth, setOpeningInvoiceMonth] = useState(
    initialDebt?.openingInvoiceMonth ?? new Date().toISOString().slice(0, 7)
  );
  
  const [notes, setNotes] = useState(initialDebt?.notes ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditor.trim()) return;

    setLoading(true);
    try {
      if (debtType === "credit_card") {
        await onSave({
          id: initialDebt?.id,
          debtType,
          creditor: creditor.trim(),
          dueDay: parseInt(dueDay, 10),
          openingInvoiceAmount: parseFloat(openingInvoiceAmount) || 0,
          openingInvoiceMonth,
          notes: notes.trim(),
        });
      } else {
        await onSave({
          id: initialDebt?.id,
          debtType,
          creditor: creditor.trim(),
          description: description.trim(),
          totalAmount: parseFloat(totalAmount) || undefined,
          installmentAmount: parseFloat(installmentAmount) || undefined,
          totalInstallments: parseInt(totalInstallments, 10) || undefined,
          paidInstallments: parseInt(paidInstallments, 10) || 0,
          dueDay: parseInt(dueDay, 10),
          nextDueDate: nextDueDate,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar dívida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="w-full max-w-lg bg-[#0f1423] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-scale-up">
        {/* Banner decorativo */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${debtType === "credit_card" ? "from-blue-500 to-indigo-400" : "from-amber-500 to-orange-400"}`} />
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${debtType === "credit_card" ? "text-blue-400" : "text-amber-400"}`} />
              {isEditing ? "Editar Compromisso" : "Adicionar Compromisso"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Organize seus cartões de crédito e parcelamentos locais.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Seletor de Tipo */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Tipo de Compromisso</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDebtType("installment")}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs flex flex-col items-center gap-2 transition cursor-pointer ${
                    debtType === "installment"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-[#161e33] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  Dívida / Parcelamento
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType("credit_card")}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs flex flex-col items-center gap-2 transition cursor-pointer ${
                    debtType === "credit_card"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-[#161e33] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Cartão de Crédito
                </button>
              </div>
            </div>
          )}

          {/* Nome do Credor (ou Cartão) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {debtType === "credit_card" ? "Nome do Cartão / Banco" : "Creditor / Beneficiário"}
            </label>
            <input
              type="text"
              value={creditor}
              onChange={(e) => setCreditor(e.target.value)}
              required
              placeholder={debtType === "credit_card" ? "Ex: Nubank, Inter" : "Ex: Banco do Brasil, Imobiliária"}
              className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
            />
          </div>

          {/* Campos específicos de Parcelamentos */}
          {debtType === "installment" && (
            <>
              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Descrição da Compra</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Financiamento carro, Notebook"
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Valor Total */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Valor Total da Dívida (R$)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    step="0.01"
                    placeholder="Opcional"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                  />
                </div>

                {/* Valor da Parcela */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Valor de cada Parcela (R$)</label>
                  <input
                    type="number"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    step="0.01"
                    required
                    placeholder="0,00"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Total Parcelas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Total Parcelas</label>
                  <input
                    type="number"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    required
                    min="1"
                    placeholder="12"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:border-emerald-500"
                  />
                </div>

                {/* Parcelas Pagas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Pagas até hoje</label>
                  <input
                    type="number"
                    value={paidInstallments}
                    onChange={(e) => setPaidInstallments(e.target.value)}
                    min="0"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:border-emerald-500"
                  />
                </div>

                {/* Dia de Vencimento */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Dia Vencimento</label>
                  <input
                    type="number"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    required
                    min="1"
                    max="31"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Data do Primeiro/Próximo Vencimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Data do Próximo Vencimento</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {/* Campos específicos de Cartões de Crédito */}
          {debtType === "credit_card" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Dia de Vencimento */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Dia do Vencimento</label>
                  <input
                    type="number"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    required
                    min="1"
                    max="31"
                    placeholder="10"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                  />
                </div>

                {/* Valor de Abertura da Fatura (Saldo anterior inicial se houver) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Saldo Inicial da Fatura (R$)</label>
                  <input
                    type="number"
                    value={openingInvoiceAmount}
                    onChange={(e) => setOpeningInvoiceAmount(e.target.value)}
                    step="0.01"
                    placeholder="Opcional (ex: 150)"
                    className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Mês correspondente do saldo inicial */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Mês do Saldo Inicial</label>
                <input
                  type="month"
                  value={openingInvoiceMonth}
                  onChange={(e) => setOpeningInvoiceMonth(e.target.value)}
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Notas Gerais */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Notas / Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Anotações adicionais sobre taxas de juros, cartão compartilhado, etc."
              rows={2}
              className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm transition flex items-center gap-1.5 cursor-pointer ${
                debtType === "credit_card" ? "bg-blue-500 hover:bg-blue-600" : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Compromisso"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
