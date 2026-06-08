import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createVariant,
  createVariantGroup,
  deleteVariant,
  deleteVariantGroup,
  getAllVariantGroups,
  getVariantById,
  getVariantGroupById,
  getVariants,
  updateVariant,
  updateVariantGroup,
} from "./variant.controllers.js";

const router = Router();

// Variant Groups
router.post("/groups/", authMiddleware.verifyToken, createVariantGroup);
router.get("/groups/", authMiddleware.verifyToken, getAllVariantGroups);
router.get(
  "/groups/:variantGroupId/",
  authMiddleware.verifyToken,
  getVariantGroupById,
);
router.patch(
  "/groups/:variantGroupId/",
  authMiddleware.verifyToken,
  updateVariantGroup,
);
router.delete(
  "/groups/:variantGroupId/",
  authMiddleware.verifyToken,
  deleteVariantGroup,
);

// Variants
router.post("/items/", authMiddleware.verifyToken, createVariant);
router.get("/items/", authMiddleware.verifyToken, getVariants);
router.get("/items/:variantId/", authMiddleware.verifyToken, getVariantById);
router.patch("/items/:variantId/", authMiddleware.verifyToken, updateVariant);
router.delete("/items/:variantId/", authMiddleware.verifyToken, deleteVariant);

export default router;
