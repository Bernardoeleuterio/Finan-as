-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Debt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL DEFAULT 'personal',
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Debt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Debt" ("createdAt", "creditor", "debtType", "description", "dueDay", "id", "installmentAmount", "nextDueDate", "notes", "openingInvoiceAmount", "openingInvoiceMonth", "paidInstallments", "status", "totalAmount", "totalInstallments", "updatedAt") SELECT "createdAt", "creditor", "debtType", "description", "dueDay", "id", "installmentAmount", "nextDueDate", "notes", "openingInvoiceAmount", "openingInvoiceMonth", "paidInstallments", "status", "totalAmount", "totalInstallments", "updatedAt" FROM "Debt";
DROP TABLE "Debt";
ALTER TABLE "new_Debt" RENAME TO "Debt";
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_Profile" ("age", "currentBalance", "financialGoal", "fullName", "id", "monthlyExpenses", "monthlyIncome", "monthlySavingGoal", "occupation", "onboardingCompleted", "updatedAt") SELECT "age", "currentBalance", "financialGoal", "fullName", "id", "monthlyExpenses", "monthlyIncome", "monthlySavingGoal", "occupation", "onboardingCompleted", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL DEFAULT 'personal',
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "categoryId" TEXT,
    "debtId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryId", "createdAt", "debtId", "description", "id", "paymentMethod", "transactionDate", "type", "updatedAt") SELECT "amount", "categoryId", "createdAt", "debtId", "description", "id", "paymentMethod", "transactionDate", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
