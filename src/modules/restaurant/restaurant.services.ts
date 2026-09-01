import {
  BankDetails,
  DOCUMENT_STATUS,
  Prisma,
  Restaurant,
  RESTAURANT_STATUS,
} from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppError } from "../../utils/app.error.js";

import {
  BankDetailsCreateInput,
  RestaurantCreateInput,
} from "../../generated/prisma/models.js";
import { cloudinaryService } from "../../services/claudinary.service.js";

export const applyForRestaurantService = async ({
  userId,
  data,
}: {
  userId: string;
  data: Omit<RestaurantCreateInput, "owner">;
}) => {
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
};

export const submitRestaurantBankDetailsService = async ({
  restaurantId,
  data,
}: {
  restaurantId: string;
  data: Omit<BankDetailsCreateInput, "restaurant">;
}): Promise<{ bankDetails: BankDetails; restaurant: Restaurant | null }> => {
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
};

export const documentUploadService = async ({
  restaurantId,
  documentType,
  file,
}: {
  restaurantId: string;
  documentType: string;
  file: Express.Multer.File;
}) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  const existingDocument = await prisma.document.findFirst({
    where: {
      restaurantId,
      documentType,
    },
  });

  if (
    existingDocument?.status === "APPROVED" ||
    existingDocument?.status === "PENDING"
  ) {
    throw new AppError(
      `Document of type ${documentType} already exists for this restaurant`,
      400,
    );
  }

  const fileName = documentType + "_" + Date.now() + "_" + file.originalname;

  const result = await cloudinaryService.uploadFile(file.buffer, fileName);

  if (!result || !result.secureUrl) {
    throw new AppError("Failed to upload restaurant document", 500);
  }
  
  const { publicId, assetId, secureUrl, resourceType, size } = result;

  if (existingDocument?.status === "REJECTED") {
    await prisma.document.update({
      where: { id: existingDocument.id },
      data: { publicId, assetId, resourceType, size, status: "PENDING" },
    });

    return {
      secureUrl,
      document: {
        ...existingDocument,
        publicId,
        assetId,
        secureUrl,
        resourceType,
        size,
      },
    };
  }

  const document = await prisma.document.create({
    data: {
      documentType,
      publicId: publicId,
      assetId: assetId,
      name: file.originalname,
      resourceType: resourceType,
      size,
      restaurant: {
        connect: { id: restaurantId },
      },
    },
  });
  
  return { secureUrl, document };
};

export const getRestaurantDocumentsService = async ({
  restaurantId,
}: {
  restaurantId: string;
}) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  
  const documents = await prisma.document.findMany({
    where: { restaurantId },
  });

  if (!documents || documents.length === 0) {
    throw new AppError("No documents found for this restaurant", 404);
  }

  const documentsWithSecureUrls = await Promise.all(
    documents.map(async (doc) => {
      const secureUrl = await cloudinaryService.getSecureUrl(doc.publicId);
      return {
        ...doc,
        secureUrl,
      };
    }),
  );

  return documentsWithSecureUrls;
};

export const getRestaurantByIdService = async (restaurantId: string) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      bankDetails: true,
      documents: true,
    },
  });

  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  const restaurantWithSecureUrls = {
    ...restaurant,
    documents: await Promise.all(
      restaurant?.documents?.map(async (doc) => {
        const secureUrl = await cloudinaryService.getSecureUrl(doc.publicId);
        return {
          ...doc,
          secureUrl,
        };
      }),
    ),
  };

  return restaurantWithSecureUrls;
};

export const getAllRestaurantsService = async ({
  offset = 0,
  limit = 10,
  status,
  city,
  search,
}: {
  offset?: number;
  limit?: number;
  status?: RESTAURANT_STATUS;
  city?: string;
  search?: string;
}) => {
  const skip = offset;

  const where: Prisma.RestaurantWhereInput = {
    ...(status && { status }),
    ...(city && { city: { contains: city, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { fullAddress: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      include: { bankDetails: true, documents: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { restaurants, total };
};

export const getRestaurantsByUserIdService = async (userId: string) => {
  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: userId },
    include: {
      bankDetails: true,
      documents: true,
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return await Promise.all(
    restaurants.map(async (restaurant) => ({
      ...restaurant,
      owner: restaurant.owner.name,
      documents: await Promise.all(
        restaurant.documents.map(async (doc) => ({
          ...doc,
          secureUrl: await cloudinaryService.getSecureUrl(doc.publicId),
        })),
      ),
    })),
  );
};

export const updateRestaurantDetailsService = async ({
  restaurantId,
  ownerId,
  data,
}: {
  restaurantId: string;
  ownerId: string;
  data: {
    name?: string;
    fullAddress?: string;
    city?: string;
    pinCode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  
  if (restaurant.ownerId !== ownerId) {
    throw new AppError("Forbidden: you do not own this restaurant", 403);
  }

  const updated = await prisma.restaurant.update({
    where: { id: restaurantId },
    data,
  });
  
  return updated;
};

export const toggleRestaurantOpenService = async ({
  restaurantId,
  ownerId,
}: {
  restaurantId: string;
  ownerId: string;
}) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }
  
  if (restaurant.ownerId !== ownerId) {
    throw new AppError("Forbidden: you do not own this restaurant", 403);
  }
  
  if (restaurant.status !== "APPROVED") {
    throw new AppError(
      "Only approved restaurants can be toggled open/closed",
      400,
    );
  }

  const updated = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { isOpen: !restaurant.isOpen },
  });
  
  return updated;
};

export const updateRestaurantStatusService = async ({
  restaurantId,
  status,
}: {
  restaurantId: string;
  status: RESTAURANT_STATUS;
}) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { status },
  });
  
  return updatedRestaurant;
};

export const updateRestaurantDocumentStatusService = async ({
  documentId,
  status,
  note,
}: {
  documentId: string;
  status: DOCUMENT_STATUS;
  note?: string;
}) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  
  if (!document) {
    throw new AppError("Document not found", 404);
  }

  const updatedDocument = await prisma.document.update({
    where: { id: documentId },
    data: { status, note: note ?? null },
  });
  
  return updatedDocument;
};
