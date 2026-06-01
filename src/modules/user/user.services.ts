import { User } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prismaClient.js";

export const getUserById = async (
  id: string,
): Promise<Omit<User, "password"> | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
      include: {
        addresses: true,
        restaurant: true,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Failed to get user");
  }
};
