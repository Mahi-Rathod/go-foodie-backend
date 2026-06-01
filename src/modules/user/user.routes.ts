import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  addUserAddress,
  deleteAllAddresses,
  deleteUserAddress,
  deleteUserProfile,
  getAllUsers,
  getUserProfile,
  updateUserAddress,
  updateUserProfile,
} from "./user.controllers.js";

const router = Router();

// User routes
router.get("/:id", getUserProfile);
router.patch("/:id", authMiddleware.verifyToken, updateUserProfile);
router.get("/", authMiddleware.verifyToken, getAllUsers);
router.delete("/:id", authMiddleware.verifyToken, deleteUserProfile);

// Address routes
router.post("/addresses", authMiddleware.verifyToken, addUserAddress);
router.patch("/addresses/:id", authMiddleware.verifyToken, updateUserAddress);
router.delete("/addresses/all", authMiddleware.verifyToken, deleteAllAddresses);
router.delete("/addresses/:id", authMiddleware.verifyToken, deleteUserAddress);

export default router;
