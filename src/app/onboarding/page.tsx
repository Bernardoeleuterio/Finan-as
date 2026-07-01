"use client";

import React, { useState } from "react";
import { completeOnboarding } from "./actions";
import {
  CircleDollarSign,
  ArrowRight,
  Sparkles,
  User,
  Briefcase,
  Calendar,
  Wallet,
  TrendingUp,
} from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await completeOnboarding(formData);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar o perfil.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
            <CircleDollarSign className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Bem-vindo ao <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">FinTrack</span>
          </h1>
          <p className="mt-2.5 text-slate-400 text-sm sm:text-base max-w-md">
            Seu controle financeiro pessoal 100% privado, offline e seguro. Vamos configurar seu perfil inicial.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#0f1423]/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Secção 1: Quem é você */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Bernardo Eleutério"
                      className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Profissão / Ocupação</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="occupation"
                      required
                      placeholder="Desenvolvedor de Software"
                      className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Idade</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      name="age"
                      required
                      min="13"
                      placeholder="24"
                      className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Secção 2: Saúde Financeira */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Situação Financeira
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Saldo Inicial (R$)</label>
                  <div className="relative">
                    <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      name="currentBalance"
                      step="0.01"
                      required
                      placeholder="0,00"
                      className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Renda Mensal (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
                    <input
                      type="number"
                      name="monthlyIncome"
                      step="0.01"
                      required
                      placeholder="5000,00"
                      className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Meta de Economia Mensal (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R$</span>
                    <input
                      type="number"
                      name="monthlySavingGoal"
                      step="0.01"
                      placeholder="Opcional (ex: 1000)"
                      className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Objetivo Financeiro</label>
                  <input
                    type="text"
                    name="financialGoal"
                    placeholder="Ex: Comprar um carro, investir"
                    className="w-full bg-[#161e33]/50 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Concluir Configuração
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
