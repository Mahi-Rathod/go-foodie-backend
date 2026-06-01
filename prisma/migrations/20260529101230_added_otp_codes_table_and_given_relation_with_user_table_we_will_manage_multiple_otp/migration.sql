-- CreateEnum
CREATE TYPE "OTP_IDENTIFIER" AS ENUM ('MOBILE', 'EMAIL');

-- CreateEnum
CREATE TYPE "OTP_PURPOSE" AS ENUM ('REGISTER', 'LOGIN', 'RESET_PASSWORD', 'DELETE_ACCOUNT');

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "OtpCodes" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "purpose" "OTP_PURPOSE" NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "OtpCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCodes_identifier_purpose_idx" ON "OtpCodes"("identifier", "purpose");

-- AddForeignKey
ALTER TABLE "OtpCodes" ADD CONSTRAINT "OtpCodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
