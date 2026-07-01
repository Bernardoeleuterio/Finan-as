"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActiveProfileId } from "@/lib/profile";

export async function getDebtsData() {
  const activeProfileId = await getActiveProfileId();

  const debts = await prisma.debt.findMany({
    where: {
      profileId: activeProfileId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      profileId: activeProfileId,
    },
    include: {
      category: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  return { debts, transactions };
}

export async function saveDebtAction(data: {
  id?: string;
  debtType: string;
  creditor: string;
  description?: string;
  totalAmount?: number;
  installmentAmount?: number;
  totalInstallments?: number;
  paidInstallments?: number;
  dueDay: number;
  nextDueDate?: Date | string;
  openingInvoiceAmount?: number;
  openingInvoiceMonth?: string;
  notes?: string;
}) {
  const activeProfileId = await getActiveProfileId();
  const dateObj = data.nextDueDate ? new Date(data.nextDueDate) : null;

  if (data.id) {
    await prisma.debt.update({
      where: { id: data.id },
      data: {
        debtType: data.debtType,
        creditor: data.creditor,
        description: data.description || null,
        totalAmount: data.totalAmount || null,
        installmentAmount: data.installmentAmount || null,
        totalInstallments: data.totalInstallments || null,
        paidInstallments: data.paidInstallments ?? 0,
        dueDay: data.dueDay,
        nextDueDate: dateObj,
        openingInvoiceAmount: data.openingInvoiceAmount || null,
        openingInvoiceMonth: data.openingInvoiceMonth || null,
        notes: data.notes || null,
        status: data.totalInstallments && (data.paidInstallments ?? 0) >= data.totalInstallments ? "paid" : "active",
      },
    });
  } else {
    await prisma.debt.create({
      data: {
        profileId: activeProfileId,
        debtType: data.debtType,
        creditor: data.creditor,
        description: data.description || null,
        totalAmount: data.totalAmount || null,
        installmentAmount: data.installmentAmount || null,
        totalInstallments: data.totalInstallments || null,
        paidInstallments: data.paidInstallments ?? 0,
        dueDay: data.dueDay,
        nextDueDate: dateObj,
        openingInvoiceAmount: data.openingInvoiceAmount || null,
        openingInvoiceMonth: data.openingInvoiceMonth || null,
        notes: data.notes || null,
        status: "active",
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/dividas");
  revalidatePath("/transacoes");
}

export async function deleteDebtAction(id: string) {
  await prisma.debt.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/dividas");
  revalidatePath("/transacoes");
}

export async function payDebtInstallmentAction(debtId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
  });

  if (!debt) throw new Error("Dívida não encontrada.");
  if (debt.debtType !== "installment") throw new Error("Apenas dívidas parceladas podem ser pagas.");
  if (debt.status === "paid") throw new Error("Esta dívida já está quitada.");

  const total = debt.totalInstallments ?? 1;
  const currentPaid = debt.paidInstallments ?? 0;
  const nextPaid = Math.min(currentPaid + 1, total);
  const isPaid = nextPaid === total;

  let nextDueDate = null;
  if (debt.nextDueDate) {
    const current = new Date(debt.nextDueDate);
    nextDueDate = new Date(current.setMonth(current.getMonth() + 1));
  }

  // 1. Atualizar a dívida
  await prisma.debt.update({
    where: { id: debtId },
    data: {
      paidInstallments: nextPaid,
      status: isPaid ? "paid" : "active",
      nextDueDate: isPaid ? null : nextDueDate,
    },
  });

  // 2. Buscar/Criar categoria "Dívidas & Empréstimos"
  let category = await prisma.category.findFirst({
    where: { name: "Dívidas & Empréstimos" },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name: "Dívidas & Empréstimos", type: "expense" },
    });
  }

  // 3. Criar transação correspondente (Despesa)
  const installmentNum = nextPaid;
  await prisma.transaction.create({
    data: {
      profileId: debt.profileId,
      description: `Parcela ${installmentNum}/${total} - ${debt.creditor}`,
      type: "expense",
      amount: debt.installmentAmount ?? 0,
      paymentMethod: "pix",
      transactionDate: new Date(),
      categoryId: category.id,
      debtId: debt.id,
    },
  });

  // 4. Reduzir o saldo atual no perfil correspondente
  await prisma.profile.update({
    where: { id: debt.profileId },
    data: {
      currentBalance: {
        decrement: debt.installmentAmount ?? 0,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/dividas");
  revalidatePath("/transacoes");
  revalidatePath("/profile");
}
