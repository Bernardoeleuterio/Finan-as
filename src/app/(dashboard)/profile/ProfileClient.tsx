"use client";

import React, { useState } from "react";
import { updateProfile } from "./actions";
import {
  User,
  Briefcase,
  Calendar,
  Wallet,
  Target,
  Edit2,
  X,
  Check,
  TrendingUp,
  Shield,
} from "lucide-react";

interface Profile {
  fullName: string;
  occupation: string;
  age: number;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number | null;
  monthlySavingGoal: number | null;
  financialGoal: string | null;
}

interface ProfileClientProps {
  initialProfile: Profile;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (val: number | null) => {
    if (val === null) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await updateProfile(formData);
      // Atualizar estado local
      setProfile({
        fullName: formData.get("fullName") as string,
        occupation: formData.get("occupation") as string,
        age: parseInt(formData.get("age") as string, 10),
        currentBalance: parseFloat(formData.get("currentBalance") as string) || 0,
        monthlyIncome: parseFloat(formData.get("monthlyIncome") as string) || 0,
        monthlyExpenses: profile.monthlyExpenses, // Mantém do banco
        monthlySavingGoal: parseFloat(formData.get("monthlySavingGoal") as string) || 0,
        financialGoal: formData.get("financialGoal") as string || "",
      });
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar dados.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-[#0f1423] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10 relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-emerald-500/10">
            {getInitials(profile.fullName)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{profile.fullName}</h1>
            <p className="text-slate-400 font-medium text-sm flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              {profile.occupation}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <span className="text-[11px] font-semibold bg-[#161e33] border border-slate-800 text-slate-300 py-1.5 px-3 rounded-full flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {profile.age} anos
              </span>
              <span className="text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1.5 px-3 rounded-full flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Dados Protegidos Localmente
              </span>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800 text-white font-semibold text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-slate-300" />
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Form de Edição */
        <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Editar Perfil Financeiro</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={profile.fullName}
                  required
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Ocupação</label>
                <input
                  type="text"
                  name="occupation"
                  defaultValue={profile.occupation}
                  required
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Idade</label>
                <input
                  type="number"
                  name="age"
                  defaultValue={profile.age}
                  required
                  min="13"
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Saldo Atual (R$)</label>
                <input
                  type="number"
                  name="currentBalance"
                  defaultValue={profile.currentBalance}
                  step="0.01"
                  required
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Renda Mensal (R$)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  defaultValue={profile.monthlyIncome}
                  step="0.01"
                  required
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Meta de Economia (R$)</label>
                <input
                  type="number"
                  name="monthlySavingGoal"
                  defaultValue={profile.monthlySavingGoal || ""}
                  step="0.01"
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-2">Objetivo Financeiro</label>
                <input
                  type="text"
                  name="financialGoal"
                  defaultValue={profile.financialGoal || ""}
                  className="w-full bg-[#161e33] border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Visualização dos Dados */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Dados de Perfil
            </h2>
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <p className="text-xs text-slate-500 font-medium">Nome Completo</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.fullName}</p>
              </div>
              <div className="pb-3 border-b border-slate-800">
                <p className="text-xs text-slate-500 font-medium">Ocupação / Cargo</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.occupation}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Idade Registrada</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.age} anos</p>
              </div>
            </div>
          </div>

          {/* Dados Financeiros */}
          <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Metas e Configurações Financeiras
            </h2>
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Saldo em Caixa</p>
                  <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                    {formatCurrency(profile.currentBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Renda Mensal</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {formatCurrency(profile.monthlyIncome)}
                  </p>
                </div>
              </div>
              <div className="pb-3 border-b border-slate-800">
                <p className="text-xs text-slate-500 font-medium font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Meta de Economia Mensal
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {formatCurrency(profile.monthlySavingGoal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  Objetivo Principal
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {profile.financialGoal || "Nenhum objetivo cadastrado."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
