import { Order } from "../../generated/prisma/client.js";
import { ORDER_STATUS } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prismaClient.js";
import { PlaceOrderInput } from "../../types/order.types.js";
import { AppError } from "../../utils/app.error.js";

export const createOrdersService = async ({
  userId,
  orders,
  addressId,
}: PlaceOrderInput) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });
  
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  if (address.userId !== userId) {
    throw new AppError("Address does not belong to user", 403);
  }

  const menuItemIds = orders.map((order) => order.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: menuItemIds,
      },
    },
  });

  if (menuItems.length !== menuItemIds.length) {
    throw new AppError("Menu items not found", 404);
  }

  const variantIds = orders.flatMap((order) => order.variants);
  if (variantIds.length > 0) {
    const variants = await prisma.variant.findMany({
      where: {
        id: {
          in: variantIds,
        },
      },
    });

    if (variants.length !== variantIds.length) {
      throw new AppError("Some variants not found", 404);
    }
  }

  const addonIds = orders.flatMap((order) => order.addons);
  if (addonIds.length > 0) {
    const addons = await prisma.addon.findMany({
      where: {
        id: {
          in: addonIds,
        },
      },
    });

    if (addons.length !== addonIds.length) {
      throw new AppError("Some addons not found", 404);
    }
  }

  const ordersByRestaurant = orders.reduce<
    Record<string, PlaceOrderInput["orders"]>
  >((acc, order) => {
    (acc[order.restaurantId] ??= []).push(order);
    return acc;
  }, {});

  const placedOrders = await prisma.$transaction(
    Object.entries(ordersByRestaurant).map(
      ([restaurantId, restaurantOrders]) =>
        prisma.order.create({
          data: {
            userId,
            restaurantId,
            totalAmount: restaurantOrders.reduce(
              (acc, order) => acc + order.price,
              0,
            ),
            status: ORDER_STATUS.PENDING,
            orderItems: {
              create: restaurantOrders.map((order) => ({
                menuItemId: order.menuItemId,
                quantity: order.quantity,
                price: order.price,
                ...(order.variants.length > 0 && {
                  variants: {
                    connect: order.variants.map((id) => ({ id })),
                  },
                }),
                ...(order.addons.length > 0 && {
                  addons: {
                    connect: order.addons.map((id) => ({ id })),
                  },
                }),
              })),
            },
          },
          include: {
            orderItems: {
              include: {
                menuItem: true,
                variants: true,
                addons: true,
              },
            },
          },
        }),
    ),
  );

  return placedOrders;
};

export const getOrdersByUserIdService = async ({
  userId,
}: {
  userId: string;
}): Promise<Order[]> => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variants: true,
          addons: true,
        },
      },
    },
  });
  
  return orders;
};

export const getOrderByIdService = async ({
  orderId,
}: {
  orderId: string;
}): Promise<Order> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variants: true,
          addons: true,
        },
      },
    },
  });
  
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  
  return order;
};

export const updateOrderStatusService = async ({
  orderId,
  status,
}: {
  orderId: string;
  status: ORDER_STATUS;
}): Promise<Order> => {
  const order = await prisma.order.update({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: true,
          variants: true,
          addons: true,
        },
      },
    },
    data: { status },
  });
  
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  
  return order;
};

//Restaurant Order Services
export const getOrdersByRestaurantIdService = async ({
  restaurantId,
  offset,
  limit,
  search,
}: {
  restaurantId: string;
  offset: number;
  limit: number;
  search: string;
}): Promise<{ total: number; orders: Order[] }> => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip: offset,
      take: limit,
      where: {
        restaurantId,
        ...(search && {
          OR: [
            { userId: { contains: search, mode: "insensitive" } },
            { restaurantId: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            variants: true,
            addons: true,
          },
        },
      },
    }),
    prisma.order.count({ where: { restaurantId } }),
  ]);
  
  if (!orders) {
    throw new AppError("Orders not found", 404);
  }
  
  return { total, orders };
};
