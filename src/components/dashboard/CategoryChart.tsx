"use client";

import React, { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="bg-[#0f1423] border border-slate-800 rounded-3xl p-6 shadow-md">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-emerald-400" />
        Despesas por Categoria (Este Mês)
      </h2>
      <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
        {mounted ? (
          data.length > 0 ? (
            <>
              <div className="h-full flex-1 w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: unknown) => formatCurrency(Number(value))}
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
                {data.map((entry, index) => (
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
  );
}
