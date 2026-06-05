import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  applyForRestaurant,
  getAllRestaurants,
  getMyRestaurants,
  getRestaurantDocuments,
  getRestaurantsById,
  getRestaurantsByUserId,
  submitRestaurantBankDetails,
  toggleRestaurantOpen,
  updateRestaurantDetails,
  updateRestaurantDocumentStatus,
  updateRestaurantStatus,
  uploadRestaurantDocuments,
} from "./restaurant.controllers.js";

const router = Router();

// Create
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

// Read
router.get("/", authMiddleware.verifyToken, getAllRestaurants);
router.get("/my/", authMiddleware.verifyToken, getMyRestaurants);

router.get(
  "/:restaurantId/documents/",
  authMiddleware.verifyToken,
  getRestaurantDocuments,
);
router.get("/:restaurantId/", authMiddleware.verifyToken, getRestaurantsById);

// Update
router.patch(
  "/details/:restaurantId/",
  authMiddleware.verifyToken,
  updateRestaurantDetails,
);
router.patch(
  "/toggle/:restaurantId/",
  authMiddleware.verifyToken,
  toggleRestaurantOpen,
);

// Admin Routes

router.get(
  "/user/:userId/",
  authMiddleware.verifyAdmin,
  getRestaurantsByUserId,
);

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
