import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  applyForRestaurant,
  submitRestaurantBankDetails,
  uploadRestaurantDocuments,
} from "./restaurant.controllers.js";

const router = Router();

router.post("/apply/", authMiddleware.verifyToken, applyForRestaurant);
router.post(
  "/bank-details/:restaurantId/",
  authMiddleware.verifyToken,
  submitRestaurantBankDetails,
);

router.post(
  "/upload-restaurant-documents",
  authMiddleware.verifyToken,
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  uploadRestaurantDocuments,
);

export default router;
