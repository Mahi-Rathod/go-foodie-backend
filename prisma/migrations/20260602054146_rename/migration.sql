/*
  Warnings:

  - You are about to drop the column `account_holder` on the `BankDetails` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `BankDetails` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `BankDetails` table. All the data in the column will be lost.
  - Added the required column `accountHolderName` to the `BankDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumber` to the `BankDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `BankDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankDetails" DROP COLUMN "account_holder",
DROP COLUMN "account_number",
DROP COLUMN "bank_name",
ADD COLUMN     "accountHolderName" TEXT NOT NULL,
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "bankName" TEXT NOT NULL;
