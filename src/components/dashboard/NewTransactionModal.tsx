"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Sparkles, FolderPlus, CreditCard } from "lucide-react";

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
  type: string; // "income" | "expense"
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  categoryId: string | null;
  debtId: string | null;
}

interface NewTransactionModalProps {
  categories: Category[];
  debts: Debt[];
  initialTransaction?: Transaction | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    description: string;
    type: "income" | "expense";
    amount: number;
    paymentMethod: string;
    transactionDate: string;
    categoryId?: string;
    debtId?: string;
  }) => Promise<void>;
  onCreateCategory: (name: string, type: "income" | "expense" | "both") => Promise<Category>;
}

export function NewTransactionModal({
  categories,
  debts,
  initialTransaction,
  onClose,
  onSave,
  onCreateCategory,
}: NewTransactionModalProps) {
  const isEditing = Boolean(initialTransaction);
  
  const [type, setType] = useState<"income" | "expense">(
    (initialTransaction?.type as "income" | "expense") ?? "expense"
  );
  const [amount, setAmount] = useState<string>(
    initialTransaction?.amount?.toString() ?? ""
  );
  const [description, setDescription] = useState<string>(
    initialTransaction?.description ?? ""
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    initialTransaction?.paymentMethod ?? "pix"
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialTransaction?.categoryId ?? ""
  );
  const [debtId, setDebtId] = useState<string>(
    initialTransaction?.debtId ?? ""
  );
  
  // Format Date for Input Value
  const formatDateForInput = (dateVal: Date | string | undefined) => {
    if (!dateVal) return new Date().toISOString().slice(0, 10);
    const dateObj = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return dateObj.toISOString().slice(0, 10);
  };
  const [transactionDate, setTransactionDate] = useState<string>(
    formatDateForInput(initialTransaction?.transactionDate)
  );

  // Category Creator state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [catError, setCatError] = useState("");

  // Filtrar categorias conforme o tipo selecionado (Receita / Despesa)
  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  // Ajustar categoria selecionada se ela não estiver na lista filtrada
  useEffect(() => {
    if (initialTransaction && initialTransaction.type === type) {
      setCategoryId(initialTransaction.categoryId ?? "");
    } else if (filteredCategories.length > 0) {
      // Se tiver carregado, seleciona a primeira da lista
      const isAlreadyInList = filteredCategories.some((c) => c.id === categoryId);
      if (!isAlreadyInList) {
        setCategoryId(filteredCategories[0].id);
      }
    } else {
      setCategoryId("");
    }
  }, [type, categories]);

  // Se o método de pagamento não for cartão, limpa a dívida vinculada
  useEffect(() => {
    if (paymentMethod !== "card") {
      setDebtId("");
    } else if (debts.length > 0 && !debtId) {
      setDebtId(debts[0].id);
    }
  }, [paymentMethod, debts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    await onSave({
      id: initialTransaction?.id,
      description: description.trim(),
      type,
      amount: parsedAmount,
      paymentMethod,
      transactionDate,
      categoryId: categoryId || undefined,
      debtId: paymentMethod === "card" && debtId ? debtId : undefined,
    });

    onClose();
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCatError("");
    setIsCreatingCategory(true);
    try {
      const created = await onCreateCategory(name, type);
      setCategoryId(created.id);
      setNewCategoryName("");
    } catch (err: any) {
      setCatError("Erro ao criar categoria.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="w-full max-w-lg bg-[#0f1423] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-scale-up">
        {/* Banner decorativo */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${type === "income" ? "from-emerald-500 to-teal-400" : "from-rose-500 to-orange-400"}`} />
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${type === "income" ? "text-emerald-400" : "text-rose-400"}`} />
              {isEditing ? "Editar Transação" : "Nova Transação"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isEditing ? "Edite os campos abaixo para atualizar o lançamento local." : "Registre seus dados financeiros locais."}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Tipo de Fluxo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "income" | "expense")}
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="expense">Despesa (Saída)</option>
                <option value="income">Receita (Entrada)</option>
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Valor (R$)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
              required
              placeholder="Ex: Mercado semanal, Salário"
              className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 cursor-pointer"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                {filteredCategories.length === 0 && (
                  <option value="">Nenhuma categoria</option>
                )}
              </select>
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="pix">Pix</option>
                <option value="card">Cartão de Crédito</option>
                <option value="cash">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          </div>

          {/* Dívida Associada (se for Cartão de Crédito) */}
          {paymentMethod === "card" && (
            <div className="p-3 bg-[#161e33]/50 border border-slate-800 rounded-2xl animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                Vincular a qual Cartão/Dívida?
              </label>
              <select
                value={debtId}
                onChange={(e) => setDebtId(e.target.value)}
                required
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Selecione um cartão</option>
                {debts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.creditor} ({d.debtType === "credit_card" ? "Cartão" : "Parcelamento"})
                  </option>
                ))}
              </select>
              {debts.length === 0 && (
                <p className="text-[10px] text-amber-400 font-semibold mt-1">
                  Cadastre um cartão de crédito na página de "Dívidas" antes para parcelar compras.
                </p>
              )}
            </div>
          )}

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Data da Transação</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500"
            />
          </div>

          {/* Criador de Categorias Rápido */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <FolderPlus className="w-3 h-3 text-emerald-400" />
                  Criar Nova Categoria
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Farmácia, Viagens"
                  maxLength={40}
                  className="w-full bg-[#161e33]/50 border border-slate-700/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>
            {catError && <p className="text-[10px] text-rose-400 font-semibold">{catError}</p>}
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
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm transition cursor-pointer ${
                type === "income"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              {isEditing ? "Salvar Alterações" : "Salvar Transação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
