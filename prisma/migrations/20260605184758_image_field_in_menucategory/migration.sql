/*
  Warnings:

  - You are about to drop the column `image` on the `MenuCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuCategory" DROP COLUMN "image",
ADD COLUMN     "imageId" TEXT;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
