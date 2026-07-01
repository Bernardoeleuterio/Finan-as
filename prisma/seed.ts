import prisma from "../src/lib/db";

async function main() {
  console.log("Iniciando seed do banco de dados multi-contas...");

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

  // 2. Criar Perfil Pessoal ("personal")
  const personalProfile = await prisma.profile.create({
    data: {
      id: "personal",
      fullName: "Bernardo Eleutério",
      occupation: "Desenvolvedor de Software",
      age: 24,
      currentBalance: 3250.00,
      monthlyIncome: 6500.00,
      monthlyExpenses: 2800.00,
      monthlySavingGoal: 1500.00,
      financialGoal: "Comprar um novo notebook de alta performance",
      onboardingCompleted: true,
    },
  });

  // 3. Criar Perfil Familiar ("family")
  const familyProfile = await prisma.profile.create({
    data: {
      id: "family",
      fullName: "Família Eleutério",
      occupation: "Orçamento Coletivo",
      age: 45,
      currentBalance: 12450.00,
      monthlyIncome: 14500.00,
      monthlyExpenses: 8200.00,
      monthlySavingGoal: 4000.00,
      financialGoal: "Viagem de férias em família e reserva de emergência",
      onboardingCompleted: true,
    },
  });

  console.log("Perfis financeiro Pessoal e Familiar criados.");

  const devDate = new Date();

  // --- DADOS DO PERFIL PESSOAL ---
  const personalDebt = await prisma.debt.create({
    data: {
      profileId: "personal",
      debtType: "installment",
      creditor: "Lojas Americanas",
      description: "Ar Condicionado Split",
      totalAmount: 1800.00,
      installmentAmount: 300.00,
      totalInstallments: 6,
      paidInstallments: 2,
      dueDay: 10,
      nextDueDate: new Date(devDate.getFullYear(), devDate.getMonth(), 10),
      notes: "Parcelado sem juros no cartão",
      status: "active",
    },
  });

  // --- DADOS DO PERFIL FAMILIAR ---
  const familyDebt1 = await prisma.debt.create({
    data: {
      profileId: "family",
      debtType: "credit_card",
      creditor: "Visa Gold Família",
      description: "Cartão de despesas familiares",
      dueDay: 5,
      openingInvoiceAmount: 450.00,
      openingInvoiceMonth: `${devDate.getFullYear()}-${String(devDate.getMonth() + 1).padStart(2, "0")}`,
      notes: "Cartão compartilhado entre cônjuges",
      status: "active",
    },
  });

  const familyDebt2 = await prisma.debt.create({
    data: {
      profileId: "family",
      debtType: "installment",
      creditor: "Móveis Dell Anno",
      description: "Armários Planejados Cozinha",
      totalAmount: 12000.00,
      installmentAmount: 1000.00,
      totalInstallments: 12,
      paidInstallments: 4,
      dueDay: 15,
      nextDueDate: new Date(devDate.getFullYear(), devDate.getMonth(), 15),
      notes: "Débito automático em conta familiar",
      status: "active",
    },
  });

  console.log("Dívidas de exemplo criadas para ambas as contas.");

  const catSalario = categories.find((c) => c.name === "Salário")!;
  const catAlimentacao = categories.find((c) => c.name === "Alimentação")!;
  const catMoradia = categories.find((c) => c.name === "Moradia")!;
  const catTransporte = categories.find((c) => c.name === "Transporte")!;
  const catAssinaturas = categories.find((c) => c.name === "Assinaturas & Serviços")!;
  const catDividas = categories.find((c) => c.name === "Dívidas & Empréstimos")!;

  // Transações Pessoais
  const personalTransactions = [
    {
      profileId: "personal",
      description: "Salário Bernardo",
      type: "income",
      amount: 6500.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 5),
      categoryId: catSalario.id,
    },
    {
      profileId: "personal",
      description: "Supermercado Pessoal",
      type: "expense",
      amount: 452.80,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 6),
      categoryId: catAlimentacao.id,
    },
    {
      profileId: "personal",
      description: "Aluguel Quarto",
      type: "expense",
      amount: 1500.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 8),
      categoryId: catMoradia.id,
    },
    {
      profileId: "personal",
      description: "Parcela 2/6 - Ar Condicionado",
      type: "expense",
      amount: 300.00,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 10),
      categoryId: catDividas.id,
      debtId: personalDebt.id,
    },
  ];

  // Transações Familiares
  const familyTransactions = [
    {
      profileId: "family",
      description: "Salário Conjunto",
      type: "income",
      amount: 14500.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 5),
      categoryId: catSalario.id,
    },
    {
      profileId: "family",
      description: "Rancho Mensal Atacadão",
      type: "expense",
      amount: 1850.00,
      paymentMethod: "card",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 3),
      categoryId: catAlimentacao.id,
      debtId: familyDebt1.id, // Vinculado ao cartão família
    },
    {
      profileId: "family",
      description: "Prestação da Casa",
      type: "expense",
      amount: 3200.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 10),
      categoryId: catMoradia.id,
    },
    {
      profileId: "family",
      description: "Parcela 4/12 - Armários Cozinha",
      type: "expense",
      amount: 1000.00,
      paymentMethod: "pix",
      transactionDate: new Date(devDate.getFullYear(), devDate.getMonth(), 15),
      categoryId: catDividas.id,
      debtId: familyDebt2.id,
    },
  ];

  for (const trans of [...personalTransactions, ...familyTransactions]) {
    await prisma.transaction.create({
      data: trans,
    });
  }

  console.log("Transações de exemplo criadas para ambas as contas.");
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
