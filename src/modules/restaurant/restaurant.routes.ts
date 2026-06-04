import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  applyForRestaurant,
  getRestaurantsById,
  submitRestaurantBankDetails,
  updateRestaurantDocumentStatus,
  updateRestaurantStatus,
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
  "/documents/:restaurantId/",
  authMiddleware.verifyToken,
  upload.single("file"),
  uploadRestaurantDocuments,
);

router.get("/:restaurantId/", authMiddleware.verifyToken, getRestaurantsById);

router.patch(
  "/status/:restaurantId/",
  authMiddleware.verifyAdmin,
  updateRestaurantStatus,
);

router.patch(
  "/documents/:documentId/",
  authMiddleware.verifyAdmin,
  updateRestaurantDocumentStatus,
);
export default router;
