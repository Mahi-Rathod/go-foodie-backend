import { Address, User } from "../../generated/prisma/client.js";
import { UserUpdateInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prismaClient.js";
import { AddressInput } from "../../types/user.types.js";
import { AppError } from "../../utils/app.error.js";

export const getUserByIdService = async (
  id: string,
): Promise<Omit<User, "password"> | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true,
    },
    include: {
      addresses: true,
      restaurants: true,
    },
  });
  
  return user;
};

export const getAllUsersService = async ({
  offset,
  limit,
  search,
}: {
  offset: number;
  limit: number;
  search: string;
}): Promise<{
  results: Omit<User, "password">[];
  total: number;
  offset: number;
  limit: number;
}> => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },
    skip: offset,
    take: limit,
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
      ],
    },
  });
  
  return {
    results: users,
    total: users.length,
    offset,
    limit,
  };
};

export const updateUserProfileService = async ({
  id,
  updatedUserData,
}: {
  id: string;
  updatedUserData: UserUpdateInput;
}): Promise<Omit<User, "password"> | null> => {
  const user = await prisma.user.update({
    where: { id },
    data: updatedUserData,
    omit: {
      password: true,
    },
  });
  
  return user;
};

export const deleteUserProfileService = async ({
  id,
}: {
  id: string;
}): Promise<{ message: string } | null> => {
  await prisma.user.delete({
    where: { id },
  });

  return { message: "User profile deleted successfully" };
};

export const addUserAddressService = async ({
  userId,
  label,
  fullAddress,
  landmark,
  city,
  state,
  pinCode,
  country,
  latitude,
  longitude,
}: AddressInput): Promise<Address | null> => {
  const address = await prisma.address.create({
    data: {
      label,
      fullAddress,
      landmark: landmark ?? null,
      city,
      state,
      pinCode,
      country,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      user: {
        connect: { id: userId },
      },
    },
  });
  
  return address;
};

export const updateUserAddressService = async ({
  id,
  newAddress,
}: {
  id: string;
  newAddress: Partial<AddressInput>;
}): Promise<Address | null> => {
  const address = await prisma.address.update({
    where: { id: id as string },
    data: newAddress,
  });
  
  return address;
};

export const deleteUserAddressService = async ({
  id,
}: {
  id: string;
}): Promise<{ message: string } | null> => {
  await prisma.address.delete({
    where: { id: id as string },
  });
  
  return { message: "Address deleted successfully" };
};

export const deleteAllAddressesService = async ({
  userId,
}: {
  userId: string;
}): Promise<{ message: string } | null> => {
  await prisma.address.deleteMany({
    where: { userId },
  });
  
  return { message: "All addresses deleted successfully" };
};
