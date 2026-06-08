/*
  Warnings:

  - You are about to drop the column `addonGroupId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantGroupId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `addonGroupId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantGroupId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_addonGroupId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_variantGroupId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_addonGroupId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantGroupId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "addonGroupId",
DROP COLUMN "variantGroupId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "addonGroupId",
DROP COLUMN "variantGroupId";

-- CreateTable
CREATE TABLE "_AddonToCartItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AddonToCartItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AddonToOrderItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AddonToOrderItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CartItemToVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CartItemToVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrderItemToVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderItemToVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AddonToCartItem_B_index" ON "_AddonToCartItem"("B");

-- CreateIndex
CREATE INDEX "_AddonToOrderItem_B_index" ON "_AddonToOrderItem"("B");

-- CreateIndex
CREATE INDEX "_CartItemToVariant_B_index" ON "_CartItemToVariant"("B");

-- CreateIndex
CREATE INDEX "_OrderItemToVariant_B_index" ON "_OrderItemToVariant"("B");

-- AddForeignKey
ALTER TABLE "_AddonToCartItem" ADD CONSTRAINT "_AddonToCartItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonToCartItem" ADD CONSTRAINT "_AddonToCartItem_B_fkey" FOREIGN KEY ("B") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonToOrderItem" ADD CONSTRAINT "_AddonToOrderItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonToOrderItem" ADD CONSTRAINT "_AddonToOrderItem_B_fkey" FOREIGN KEY ("B") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToVariant" ADD CONSTRAINT "_CartItemToVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToVariant" ADD CONSTRAINT "_CartItemToVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderItemToVariant" ADD CONSTRAINT "_OrderItemToVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderItemToVariant" ADD CONSTRAINT "_OrderItemToVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
