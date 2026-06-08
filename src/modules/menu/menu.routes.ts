import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  getAllMenuCategories,
  getAllMenuItems,
  getMenuCategoryById,
  getMenuItemById,
  updateMenuItem,
} from "./menu.controllers.js";

const router = Router();

//Categories
router.post(
  "/",
  authMiddleware.verifyToken,
  upload.single("file"),
  createMenuCategory,
);

router.get("/categories/", authMiddleware.verifyToken, getAllMenuCategories);

router.get(
  "/categories/:menuCategoryId/",
  authMiddleware.verifyToken,
  getMenuCategoryById,
);

router.delete(
  "/categories/:menuCategoryId/",
  authMiddleware.verifyToken,
  deleteMenuCategory,
);

//Items
router.post(
  "/items/",
  authMiddleware.verifyToken,
  upload.single("file"),
  createMenuItem,
);

router.get("/items/", authMiddleware.verifyToken, getAllMenuItems);
router.get("/items/:menuItemId/", authMiddleware.verifyToken, getMenuItemById);
router.delete(
  "/items/:menuItemId/",
  authMiddleware.verifyToken,
  deleteMenuItem,
);

router.put(
  "/items/:menuItemId/",
  authMiddleware.verifyToken,
  upload.single("file"),
  updateMenuItem,
);

//Variant Groups
// router.post("/variant-groups/", authMiddleware.verifyToken, createVariantGroup);
// router.get("/variant-groups/", authMiddleware.verifyToken, getAllVariantGroups);
// router.get(
//   "/variant-groups/:variantGroupId/",
//   authMiddleware.verifyToken,
//   getVariantGroupById,
// );
// router.delete(
//   "/variant-groups/:variantGroupId/",
//   authMiddleware.verifyToken,
//   deleteVariantGroup,
// );

export default router;
