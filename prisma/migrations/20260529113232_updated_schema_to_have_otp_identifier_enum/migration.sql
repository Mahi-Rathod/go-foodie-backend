/*
  Warnings:

  - Changed the type of `identifier` on the `OtpCodes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OtpCodes" DROP COLUMN "identifier",
ADD COLUMN     "identifier" "OTP_IDENTIFIER" NOT NULL;

-- CreateIndex
CREATE INDEX "OtpCodes_identifier_purpose_idx" ON "OtpCodes"("identifier", "purpose");
