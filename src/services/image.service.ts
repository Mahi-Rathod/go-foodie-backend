import { prisma } from "../lib/prismaClient.js";
import { AppError } from "../utils/app.error.js";
import { cloudinaryService } from "./claudinary.service.js";

class ImageService {
  async upload(
    file: Express.Multer.File,
  ): Promise<{ secureUrl: string; imageId: string }> {
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
  }
}

export const imageService = new ImageService();
