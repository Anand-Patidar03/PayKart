import { Router } from "express";
import {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/admin.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, isAdmin, createCategory);
router.route("/").get(getAllCategory);
router.route("/:categoryId").get(getCategoryById);
router.route("/:categoryId").patch(verifyJWT, isAdmin, updateCategory);
router.route("/:categoryId").delete(verifyJWT, isAdmin, deleteCategory);

export default router;
