/*
  Warnings:

  - You are about to drop the column `url` on the `Document` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "url",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "documentType" TEXT NOT NULL,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "resourceType" TEXT NOT NULL,
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;
