import prisma from "../src/lib/db";

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Limpar tabelas existentes
  await prisma.transaction.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();

  console.log("Limpeza concluída.");

  // 1. Criar Categorias Padrão
  const categoriesData = [
    // Receitas
    { name: "Salário", type: "income" },
    { name: "Investimentos", type: "income" },
    { name: "Freelance", type: "income" },
    { name: "Outros (Receita)", type: "income" },
    // Despesas
    { name: "Alimentação", type: "expense" },
    { name: "Moradia", type: "expense" },
    { name: "Transporte", type: "expense" },
    { name: "Saúde", type: "expense" },
    { name: "Educação", type: "expense" },
    { name: "Lazer", type: "expense" },
    { name: "Assinaturas & Serviços", type: "expense" },
    { name: "Imprevistos", type: "expense" },
    { name: "Dívidas & Empréstimos", type: "expense" },
    { name: "Outros (Despesa)", type: "expense" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categories.push(createdCat);
  }

  console.log(`${categories.length} categorias criadas.`);

  // 2. Criar Perfil Financeiro Fictício Inicial (Bernardo Eleutério)
  const profile = await prisma.profile.create({
    data: {
      id: "single-profile",
      fullName: "Bernardo Eleutério",
      occupation: "Desenvolvedor de Software",
      age: 24,
      currentBalance: 3250.00,
      monthlyIncome: 6500.00,
      monthlyExpenses: 2800.00,
      monthlySavingGoal: 1500.00,
      financialGoal: "Comprar um novo notebook de alta performance e investir na bolsa",
      onboardingCompleted: true,
    },
  });

  console.log("Perfil financeiro padrão criado.");

  // 3. Criar Dívidas (Debts) de Exemplo
  const devDate = new Date();
  
  const debt1 = await prisma.debt.create({
    data: {
      debtType: "installment",
      creditor: "Lojas Americanas",
      description: "Ar Condicionado Split",
      totalAmount: 1800.00,
      installmentAmount: 300.00,
      totalInstallments: 6,
      paidInstallments: 2,
      dueDay: 10,
      nextDueDate: new Date(devDate.getFullYear(), devDate.getMonth(), 10),
      notes: "Parcelado sem juros no cartão de crédito corporativo",
      status: "active",
    },
  });

  const debt2 = await prisma.debt.create({
    data: {
      debtType: "installment",
      creditor: "Banco do Brasil",
      description: "Financiamento de Estudos",
      totalAmount: 5000.00,
      installmentAmount: 250.00,
      totalInstallments: 20,
      paidInstallments: 12,
      dueDay: 20,
      nextDueDate: new Date(devDate.getFullYear(), devDate.getMonth(), 20),
      notes: "Taxa de juros de 1.5% a.m.",
      status: "active",
    },
  });

  console.log("Dívidas de exemplo criadas.");

  // 4. Criar Transações de Exemplo (Histórico recente)
  const catSalario = categories.find((c) => c.name === "Salário")!;
  const catAlimentacao = categories.find((c) => c.name === "Alimentação")!;
  const catMoradia = categories.find((c) => c.name === "Moradia")!;
  const catTransporte = categories.find((c) => c.name === "Transporte")!;
  const catLazer = categories.find((c) => c.name === "Lazer")!;
  const catAssinaturas = categories.find((c) => c.name === "Assinaturas & Serviços")!;
  const catDividas = categories.find((c) => c.name === "Dívidas & Empréstimos")!;

  const transactionsData = [
    {
      description: "Salário Mensal",
      type: "income",
      amount: 6500.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 5),
      categoryId: catSalario.id,
    },
    {
      description: "Supermercado Carrefour",
      type: "expense",
      amount: 452.80,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 6),
      categoryId: catAlimentacao.id,
    },
    {
      description: "Aluguel Apartamento",
      type: "expense",
      amount: 1500.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 8),
      categoryId: catMoradia.id,
    },
    {
      description: "Combustível Posto Ipiranga",
      type: "expense",
      amount: 150.00,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 12),
      categoryId: catTransporte.id,
    },
    {
      description: "Netflix & Spotify Premium",
      type: "expense",
      amount: 74.80,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 15),
      categoryId: catAssinaturas.id,
    },
    {
      description: "Jantar Restaurante Japonês",
      type: "expense",
      amount: 180.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 18),
      categoryId: catLazer.id,
    },
    {
      description: "Parcela 2/6 - Ar Condicionado",
      type: "expense",
      amount: 300.00,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 10),
      categoryId: catDividas.id,
      debtId: debt1.id,
    },
  ];

  for (const trans of transactionsData) {
    await prisma.transaction.create({
      data: trans,
    });
  }

  console.log("Transações de exemplo criadas.");
  console.log("Seed concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
