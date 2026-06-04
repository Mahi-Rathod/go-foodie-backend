import {
  BankDetails,
  DOCUMENT_STATUS,
  Restaurant,
  RESTAURANT_STATUS,
} from "../../generated/prisma/client.js";
import {
  BankDetailsCreateInput,
  RestaurantCreateInput,
} from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prismaClient.js";
import { cloudinaryService } from "../../services/claudinary.service.js";
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

export const documentUploadService = async ({
  restaurantId,
  documentType,
  file,
}: {
  restaurantId: string;
  documentType: string;
  file: Express.Multer.File;
}) => {
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new AppError("Failed to upload restaurant document", 500);
  }
};

export const getRestaurantDocumentsService = async ({
  restaurantId,
}: {
  restaurantId: string;
}) => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Failed to retrieve restaurant documents",
      500,
    );
  }
};

export const getRestaurantByIdService = async (restaurantId: string) => {
  try {
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
  } catch (error) {
    throw new AppError("Failed to retrieve restaurant details", 500);
  }
};

export const updateRestaurantStatusService = async ({
  restaurantId,
  status,
}: {
  restaurantId: string;
  status: RESTAURANT_STATUS;
}) => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update restaurant status", 500);
  }
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
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update restaurant document status", 500);
  }
};
