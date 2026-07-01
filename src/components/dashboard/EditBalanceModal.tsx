"use client";

import React, { useState } from "react";
import { X, Check, CircleDollarSign } from "lucide-react";

interface EditBalanceModalProps {
  currentBalance: number;
  onClose: () => void;
  onSave: (balance: number) => Promise<void>;
}

export function EditBalanceModal({
  currentBalance,
  onClose,
  onSave,
}: EditBalanceModalProps) {
  const [newBalance, setNewBalance] = useState(currentBalance.toString());
  const [balanceError, setBalanceError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(newBalance);
    if (isNaN(balanceNum)) {
      setBalanceError("Por favor, digite um valor válido.");
      return;
    }
    setBalanceError("");
    setLoading(true);
    try {
      await onSave(balanceNum);
      onClose();
    } catch (err) {
      console.error(err);
      setBalanceError("Erro ao atualizar o saldo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div
        className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-sm bg-[#0f1423] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-scale-up">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-emerald-400" />
              Ajustar Saldo
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Altere o saldo atual em caixa diretamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {balanceError && (
            <p className="text-xs text-rose-400 font-semibold">{balanceError}</p>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Novo Saldo (R$)
            </label>
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-350 hover:text-white text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
