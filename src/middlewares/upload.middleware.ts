import multer from "multer";

// 1. Use memory storage (no local disk)
const storage = multer.memoryStorage();

// 3. Limits (optional but recommended)
const limits: multer.Options["limits"] = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

// 4. Create multer instance
export const upload = multer({
  storage,
  limits,
});
