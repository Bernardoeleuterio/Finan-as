import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinTrack - Controle Financeiro Local",
  description: "Gerencie suas finanças pessoais localmente com total privacidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-[#070a13] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
