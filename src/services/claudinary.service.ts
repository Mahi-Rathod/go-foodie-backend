import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary from "../config/claudinary.config.js";
import { env } from "../env.js";

interface UploadResult {
  publicId: string;
  assetId: string;
  assetFolder: string;
  secureUrl: string;
  resourceType: string;
  size: number;
}

class CloudinaryService {
  uploadFile(fileBuffer: Buffer, fileName: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: env.CLOUDINARY_RESTAURANT_FOLDER_NAME,
          resource_type: "raw",
          public_id: fileName,
          access_mode: "public",
          type: "upload",
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));

          resolve({
            publicId: result.public_id,
            assetId: result.asset_id,
            assetFolder: result.asset_folder,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            size: result.bytes,
          });
        },
      );

      stream.end(fileBuffer);
    });
  }

  async getSecureUrl(publicId: string): Promise<string> {
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
    });
    return signedUrl;
  }
}
export const cloudinaryService = new CloudinaryService();
