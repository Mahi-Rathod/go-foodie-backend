/*
  Warnings:

  - You are about to drop the column `menuItemId` on the `AddonGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddonGroup" DROP CONSTRAINT "AddonGroup_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "VariantGroup" DROP CONSTRAINT "VariantGroup_menuItemId_fkey";

-- AlterTable
ALTER TABLE "AddonGroup" DROP COLUMN "menuItemId";

-- CreateTable
CREATE TABLE "_MenuItemToVariantGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MenuItemToVariantGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AddonGroupToMenuItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AddonGroupToMenuItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MenuItemToVariantGroup_B_index" ON "_MenuItemToVariantGroup"("B");

-- CreateIndex
CREATE INDEX "_AddonGroupToMenuItem_B_index" ON "_AddonGroupToMenuItem"("B");

-- AddForeignKey
ALTER TABLE "_MenuItemToVariantGroup" ADD CONSTRAINT "_MenuItemToVariantGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToVariantGroup" ADD CONSTRAINT "_MenuItemToVariantGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonGroupToMenuItem" ADD CONSTRAINT "_AddonGroupToMenuItem_A_fkey" FOREIGN KEY ("A") REFERENCES "AddonGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonGroupToMenuItem" ADD CONSTRAINT "_AddonGroupToMenuItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
