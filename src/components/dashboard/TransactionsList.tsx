"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Pencil,
  Trash2,
  Filter,
  FileSpreadsheet,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  description: string;
  type: string; // "income" | "expense"
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  categoryId: string | null;
  category: Category | null;
  debtId: string | null;
  debt: { creditor: string } | null;
}

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionsList({
  transactions,
  categories,
  onDelete,
  onEdit,
}: TransactionsListProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Format Helper
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
      timeZone: "UTC", // Manter consistência com datas do banco
    }).format(d);
  };

  const translatePaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      pix: "Pix",
      card: "Cartão de Crédito",
      cash: "Dinheiro",
      boleto: "Boleto",
    };
    return methods[method] || method;
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || tx.type === selectedType;
      const matchesCategory =
        selectedCategory === "all" || tx.categoryId === selectedCategory;
      const matchesMethod =
        selectedMethod === "all" || tx.paymentMethod === selectedMethod;

      return matchesSearch && matchesType && matchesCategory && matchesMethod;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedMethod]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    // Header do CSV
    const headers = ["Data", "Descrição", "Tipo", "Categoria", "Método de Pagamento", "Valor (R$)"];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.transactionDate),
      t.description.replace(/"/g, '""'),
      t.type === "income" ? "Receita" : "Despesa",
      t.category?.name || "Sem categoria",
      translatePaymentMethod(t.paymentMethod),
      t.amount.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + // Adiciona BOM para UTF-8 (Excel ler acentos corretamente)
      [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fintrack_transacoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar transações por descrição..."
              className="w-full bg-[#161e33]/50 border border-slate-700/80 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showFilters || selectedType !== "all" || selectedCategory !== "all" || selectedMethod !== "all"
                  ? "bg-emerald-550/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-800/30 text-slate-350 hover:bg-slate-850"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800 disabled:opacity-50 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Exportar Planilha (CSV)
            </button>
          </div>
        </div>

        {/* Expandable Filter Inputs */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/70 animate-fade-in">
            {/* Filter by Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tipo</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Todas as transações</option>
                <option value="income">Apenas Receitas (Entradas)</option>
                <option value="expense">Apenas Despesas (Saídas)</option>
              </select>
            </div>

            {/* Filter by Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Payment Method */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Forma de Pagamento</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Todas as formas</option>
                <option value="pix">Pix</option>
                <option value="card">Cartão de Crédito</option>
                <option value="cash">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table / List */}
      <div className="bg-[#0f1423] border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden sm:table">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-[#131a2e]/30">
                  <th className="py-4 px-6">Transação</th>
                  <th className="py-4 px-6">Categoria</th>
                  <th className="py-4 px-6">Método / Dívida</th>
                  <th className="py-4 px-6">Data</th>
                  <th className="py-4 px-6 text-right">Valor</th>
                  <th className="py-4 px-6 text-center w-28">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#161e33]/40 transition group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${
                            tx.type === "income"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{tx.description}</p>
                          {tx.debt && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full mt-0.5 inline-block font-semibold">
                              Dívida: {tx.debt.creditor}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-slate-300 bg-[#161e33] px-2.5 py-1 rounded-lg border border-slate-800">
                        {tx.category?.name || "Sem categoria"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs text-slate-400 font-medium">
                        {translatePaymentMethod(tx.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`text-sm font-bold tracking-tight ${
                          tx.type === "income" ? "text-emerald-400" : "text-slate-200"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          title="Editar"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-400 hover:text-white hover:border-emerald-500/40 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx)}
                          title="Excluir"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="divide-y divide-slate-800/60 sm:hidden">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white leading-snug">{tx.description}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">{formatDate(tx.transactionDate)}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400 bg-[#161e33] px-1.5 py-0.5 rounded border border-slate-800">
                            {tx.category?.name || "Sem categoria"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === "income" ? "text-emerald-400" : "text-slate-200"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                      </p>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {translatePaymentMethod(tx.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {tx.debt && (
                    <div className="text-left py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-semibold">
                      Dívida: {tx.debt.creditor}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/40">
                    <button
                      onClick={() => onEdit(tx)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 bg-slate-800/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-rose-400 bg-slate-800/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            Nenhuma transação cadastrada ou correspondente aos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
