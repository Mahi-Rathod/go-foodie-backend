import { prisma } from "../lib/prismaClient.js";
import { AppError } from "../utils/app.error.js";
import { cloudinaryService } from "./claudinary.service.js";

class ImageService {
  async upload(
    file: Express.Multer.File,
  ): Promise<{ secureUrl: string; imageId: string }> {
    try {
      const uploadedImage = await cloudinaryService.uploadFile(
        file.buffer,
        file.originalname,
      );
      if (!uploadedImage) {
        throw new AppError("Failed to upload image", 500);
      }

      const image = await prisma.image.create({
        data: {
          publicId: uploadedImage.publicId,
          assetId: uploadedImage.assetId,
          resourceType: uploadedImage.resourceType,
          size: uploadedImage.size,
        },
      });
      if (!image) {
        throw new AppError("Failed to create image", 500);
      }
      return { secureUrl: uploadedImage.secureUrl, imageId: image.id };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        error instanceof Error ? error.message : "Failed to upload image",
        500,
      );
    }
  }
}

export const imageService = new ImageService();
