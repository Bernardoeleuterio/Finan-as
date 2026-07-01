"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActiveProfileId } from "@/lib/profile";

// Buscar transações, categorias e dívidas para a tela correspondente ao perfil ativo
export async function getTransactionsData() {
  const activeProfileId = await getActiveProfileId();

  const transactions = await prisma.transaction.findMany({
    where: {
      profileId: activeProfileId,
    },
    include: {
      category: true,
      debt: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const debts = await prisma.debt.findMany({
    where: {
      profileId: activeProfileId,
      status: "active",
    },
    orderBy: {
      creditor: "asc",
    },
  });

  return { transactions, categories, debts };
}

// Salvar (Criar ou Editar) Transação
export async function saveTransactionAction(data: {
  id?: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  paymentMethod: string;
  transactionDate: Date | string;
  categoryId?: string;
  debtId?: string;
}) {
  const activeProfileId = await getActiveProfileId();
  const dateObj = new Date(data.transactionDate);
  const amountDiff = data.amount;

  if (data.id) {
    // Modo de Edição: Buscar transação existente para calcular a diferença no saldo
    const oldTx = await prisma.transaction.findUnique({
      where: { id: data.id },
    });

    if (!oldTx) throw new Error("Transação não encontrada.");

    // Atualizar no Banco
    await prisma.transaction.update({
      where: { id: data.id },
      data: {
        description: data.description,
        type: data.type,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionDate: dateObj,
        categoryId: data.categoryId || null,
        debtId: data.debtId || null,
      },
    });

    // Reverter impacto anterior no saldo do perfil
    let balanceAdjustment = 0;
    if (oldTx.type === "income") {
      balanceAdjustment -= oldTx.amount; // Remove receita antiga
    } else {
      balanceAdjustment += oldTx.amount; // Devolve despesa antiga
    }

    // Aplicar novo impacto no saldo
    if (data.type === "income") {
      balanceAdjustment += data.amount;
    } else {
      balanceAdjustment -= data.amount;
    }

    await prisma.profile.update({
      where: { id: oldTx.profileId },
      data: {
        currentBalance: {
          increment: balanceAdjustment,
        },
      },
    });
  } else {
    // Modo de Criação
    await prisma.transaction.create({
      data: {
        profileId: activeProfileId,
        description: data.description,
        type: data.type,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionDate: dateObj,
        categoryId: data.categoryId || null,
        debtId: data.debtId || null,
      },
    });

    // Atualizar saldo do perfil
    const multiplier = data.type === "income" ? 1 : -1;
    await prisma.profile.update({
      where: { id: activeProfileId },
      data: {
        currentBalance: {
          increment: amountDiff * multiplier,
        },
      },
    });

    // Se estiver vinculada a uma dívida parcelada, atualizar parcelas pagas
    if (data.debtId) {
      const debt = await prisma.debt.findUnique({
        where: { id: data.debtId },
      });

      if (debt && debt.debtType === "installment" && debt.paidInstallments !== null && debt.totalInstallments !== null) {
        const nextPaid = Math.min(debt.paidInstallments + 1, debt.totalInstallments);
        const status = nextPaid === debt.totalInstallments ? "paid" : "active";
        
        // Calcular próximo vencimento somando 1 mês
        let nextDueDate = null;
        if (debt.nextDueDate) {
          const currentDue = new Date(debt.nextDueDate);
          nextDueDate = new Date(currentDue.setMonth(currentDue.getMonth() + 1));
        }

        await prisma.debt.update({
          where: { id: data.debtId },
          data: {
            paidInstallments: nextPaid,
            status: status,
            nextDueDate: status === "paid" ? null : nextDueDate,
          },
        });
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/profile");
}

// Excluir Transação
export async function deleteTransactionAction(id: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!tx) throw new Error("Transação não encontrada.");

  // Excluir transação
  await prisma.transaction.delete({
    where: { id },
  });

  // Reverter impacto no saldo do perfil
  const multiplier = tx.type === "income" ? -1 : 1; // Se era receita, diminui saldo; se era despesa, aumenta
  await prisma.profile.update({
    where: { id: tx.profileId },
    data: {
      currentBalance: {
        increment: tx.amount * multiplier,
      },
    },
  });

  // Se a transação excluída estava associada a uma dívida, reverter o pagamento da parcela
  if (tx.debtId) {
    const debt = await prisma.debt.findUnique({
      where: { id: tx.debtId },
    });

    if (debt && debt.debtType === "installment" && debt.paidInstallments !== null && debt.paidInstallments > 0) {
      const nextPaid = debt.paidInstallments - 1;
      
      // Calcular vencimento anterior subtraindo 1 mês
      let prevDueDate = null;
      if (debt.nextDueDate) {
        const currentDue = new Date(debt.nextDueDate);
        prevDueDate = new Date(currentDue.setMonth(currentDue.getMonth() - 1));
      }

      await prisma.debt.update({
        where: { id: tx.debtId },
        data: {
          paidInstallments: nextPaid,
          status: "active",
          nextDueDate: prevDueDate,
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/profile");
}

// Criar nova Categoria dinamicamente
export async function createCategoryAction(name: string, type: "income" | "expense" | "both") {
  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
      },
    },
  });

  if (existing) return existing;

  const newCategory = await prisma.category.create({
    data: {
      name,
      type,
    },
  });

  revalidatePath("/transacoes");
  return newCategory;
}
