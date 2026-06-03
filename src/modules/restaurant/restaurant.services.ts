import { BankDetails, Restaurant } from "../../generated/prisma/client.js";
import {
  BankDetailsCreateInput,
  RestaurantCreateInput,
} from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppError } from "../../utils/app.error.js";

export const applyForRestaurantService = async ({
  userId,
  data,
}: {
  userId: string;
  data: Omit<RestaurantCreateInput, "owner">;
}) => {
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        fullAddress: data.fullAddress,
        city: data.city,
        pinCode: data.pinCode,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        owner: {
          connect: { id: userId },
        },
      },
    });
    return restaurant;
  } catch (error) {
    throw new AppError("Failed to apply for restaurant", 500);
  }
};

export const submitRestaurantBankDetailsService = async ({
  restaurantId,
  data,
}: {
  restaurantId: string;
  data: Omit<BankDetailsCreateInput, "restaurant">;
}): Promise<{ bankDetails: BankDetails; restaurant: Restaurant | null }> => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new AppError("Restaurant not found", 404);
    }

    const bankDetails = await prisma.bankDetails.create({
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        ifsc: data.ifsc,
        branch: data.branch,
        restaurant: {
          connect: { id: restaurantId },
        },
      },
    });
    return { bankDetails, restaurant };
  } catch (error) {
    throw new AppError("Failed to submit restaurant bank details", 500);
  }
};
