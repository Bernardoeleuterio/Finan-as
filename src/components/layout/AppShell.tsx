"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  WalletCards,
  UserRound,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { switchProfile } from "@/app/actions";

interface AppShellProps {
  children: ReactNode;
  profileName?: string;
  currentBalance?: number;
  activeProfileId: string;
}

export function AppShell({
  children,
  profileName = "Usuário",
  currentBalance = 0,
  activeProfileId,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { href: "/", label: "Visão Geral", icon: LayoutDashboard },
    { href: "/transacoes", label: "Transações", icon: ReceiptText },
    { href: "/dividas", label: "Dívidas", icon: WalletCards },
    { href: "/profile", label: "Perfil", icon: UserRound },
  ];

  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const handleProfileSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    await switchProfile(newId);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#070a13] text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f1423] border-r border-[#1e293b] fixed inset-y-0 left-0 z-20">
        {/* Brand */}
        <div className="p-6 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CircleDollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white">FinTrack</h1>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Local Finance</span>
          </div>
        </div>

        {/* Workspace/Account Switcher */}
        <div className="px-6 py-4 border-b border-[#1e293b] no-print">
          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-2 tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Selecionar Conta
          </label>
          <select
            value={activeProfileId}
            onChange={handleProfileSwitch}
            className="w-full bg-[#161e33] border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500 font-semibold cursor-pointer outline-none transition-all"
          >
            <option value="personal">Minha Conta (Pessoal)</option>
            <option value="family">Conta Família</option>
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#161e33] border border-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                    active ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Profile Card / Quick Balance */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-[#161e33]/80 to-[#111827] border border-[#1e293b]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <span className="text-sm font-bold text-emerald-400">{profileName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate font-medium">Bem-vindo,</p>
              <p className="text-sm font-semibold text-white truncate leading-tight">{profileName}</p>
            </div>
          </div>
          <div className="pt-2.5 border-t border-[#1e293b]">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Saldo Atual</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-lg font-bold tracking-tight ${currentBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatCurrency(currentBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 text-center border-t border-[#1e293b]">
          <p className="text-[10px] text-slate-500 font-medium">Dados 100% locais e protegidos no seu computador</p>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0f1423] border-b border-[#1e293b] sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CircleDollarSign className="w-4 h-4 text-white" />
            </div>
            {/* Mobile Workspace Switcher */}
            <select
              value={activeProfileId}
              onChange={handleProfileSwitch}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer border-none py-1"
            >
              <option value="personal" className="bg-[#0f1423] text-white">Bernardo (Pessoal)</option>
              <option value="family" className="bg-[#0f1423] text-white">Família</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${currentBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(currentBalance)}
            </span>
          </div>
        </header>

        {/* Main page content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0f1423]/95 backdrop-blur-md border-t border-[#1e293b] px-4 py-2 flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 ${
                active ? "text-emerald-400 font-semibold" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
