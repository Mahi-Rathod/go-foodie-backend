import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createAddon,
  createAddonGroup,
  deleteAddon,
  deleteAddonGroup,
  getAddonById,
  getAddonGroupById,
  getAddons,
  getAllAddonGroups,
  updateAddon,
  updateAddonGroup,
} from "./addon.controllers.js";

const router = Router();

// Addon Groups
router.post("/groups/", authMiddleware.verifyToken, createAddonGroup);
router.get("/groups/", authMiddleware.verifyToken, getAllAddonGroups);
router.get(
  "/groups/:addonGroupId/",
  authMiddleware.verifyToken,
  getAddonGroupById,
);
router.patch(
  "/groups/:addonGroupId/",
  authMiddleware.verifyToken,
  updateAddonGroup,
);
router.delete(
  "/groups/:addonGroupId/",
  authMiddleware.verifyToken,
  deleteAddonGroup,
);

// Addons (nested under groups)
router.post("/items/", authMiddleware.verifyToken, createAddon);
router.get("/items/", authMiddleware.verifyToken, getAddons);
router.get("/items/:addonId/", authMiddleware.verifyToken, getAddonById);
router.patch("/items/:addonId/", authMiddleware.verifyToken, updateAddon);
router.delete("/items/:addonId/", authMiddleware.verifyToken, deleteAddon);

export default router;
