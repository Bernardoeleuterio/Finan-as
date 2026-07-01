-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'single-profile',
    "fullName" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "currentBalance" REAL NOT NULL DEFAULT 0.0,
    "monthlyIncome" REAL NOT NULL DEFAULT 0.0,
    "monthlyExpenses" REAL,
    "monthlySavingGoal" REAL,
    "financialGoal" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "debtType" TEXT NOT NULL,
    "creditor" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" REAL,
    "installmentAmount" REAL,
    "totalInstallments" INTEGER,
    "paidInstallments" INTEGER DEFAULT 0,
    "dueDay" INTEGER NOT NULL,
    "nextDueDate" DATETIME,
    "openingInvoiceAmount" REAL,
    "openingInvoiceMonth" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "categoryId" TEXT,
    "debtId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
