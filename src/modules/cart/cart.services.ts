import { Cart, CartItem } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prismaClient.js";
import { AddToCartInput } from "../../types/cart.types.js";
import { AppError } from "../../utils/app.error.js";

export const addToCartService = async ({
  userId,
  menuItemId,
  variants,
  addons,
  quantity,
}: AddToCartInput): Promise<CartItem> => {
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });

    if (!cart) {
      throw new AppError("Failed to create cart", 500);
    }
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id: menuItemId,
    },
  });
  
  if (!menuItem) {
    throw new AppError("Menu item not found", 404);
  }

  if (!menuItem.isAvailable) {
    throw new AppError("Menu item is not available", 404);
  }

  const menuItemInCart = await prisma.cartItem.findFirst({
    where: {
      menuItemId,
      cartId: cart.id,
    },
  });

  if (menuItemInCart) {
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: menuItemInCart.id,
      },
      data: {
        quantity: menuItemInCart.quantity + quantity,
        price: menuItem.price.plus(menuItemInCart.price).times(quantity),
      },
    });
    return updatedCartItem;
  }

  const variantsData = await prisma.variant.findMany({
    where: {
      id: {
        in: variants,
      },
    },
  });

  if (variantsData.length !== variants.length) {
    throw new AppError("Some variants not found", 404);
  }

  const addonsData = await prisma.addon.findMany({
    where: {
      id: {
        in: addons,
      },
    },
  });

  if (addonsData.length !== addons.length) {
    throw new AppError("Some addons not found", 404);
  }

  let totalPrice = menuItem.price;

  variantsData.forEach((variant) => {
    totalPrice = totalPrice.plus(variant.priceModifier);
  });

  addonsData.forEach((addon) => {
    totalPrice = totalPrice.plus(addon.price);
  });

  totalPrice = totalPrice.times(quantity);

  const cartItem = await prisma.cartItem.create({
    data: {
      menuItemId,
      userId: userId,
      price: totalPrice,
      cartId: cart.id,
      variants: {
        connect: variantsData.map((variant) => ({ id: variant.id })),
      },
      addons: {
        connect: addonsData.map((addon) => ({ id: addon.id })),
      },
      quantity,
    },
  });
  
  if (!cartItem) {
    throw new AppError("Failed to add to cart", 500);
  }
  
  return cartItem;
};

export const getCartService = async (userId: string): Promise<Cart> => {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      cartItems: {
        include: {
          menuItem: true,
          variants: true,
          addons: true,
        },
      },
    },
  });
  
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  
  return cart;
};

export const updateCartItemService = async (
  cartItemId: string,
  data: {
    quantity?: number;
    variants?: string[];
    addons?: string[];
  },
): Promise<CartItem> => {
  const existingCartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });
  
  if (!existingCartItem) {
    throw new AppError("Cart item not found", 404);
  }

  const variantsData = await prisma.variant.findMany({
    where: {
      id: {
        in: data.variants || [],
      },
    },
  });
  
  if (variantsData.length !== (data.variants || []).length) {
    throw new AppError("Some variants not found", 404);
  }
  
  const addonsData = await prisma.addon.findMany({
    where: {
      id: {
        in: data.addons || [],
      },
    },
  });
  
  if (addonsData.length !== (data.addons || []).length) {
    throw new AppError("Some addons not found", 404);
  }

  const cartItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity: data.quantity || existingCartItem.quantity,
      variants: {
        connect: variantsData.map((variant) => ({ id: variant.id })),
      },
      addons: {
        connect: addonsData.map((addon) => ({ id: addon.id })),
      },
    },
  });
  
  if (!cartItem) {
    throw new AppError("Failed to update cart item", 500);
  }
  
  return cartItem;
};

export const deleteCartItemService = async (
  cartItemId: string,
): Promise<{ message: string }> => {
  const existingCartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });
  
  if (!existingCartItem) {
    throw new AppError("Cart item not found", 404);
  }
  
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
  
  return { message: "Cart item deleted successfully" };
};
