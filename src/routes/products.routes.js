import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/admin.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, isAdmin, createProduct);
router.route("/").get(getAllProducts);
router.route("/:productId").get(getProductById);
router.route("/:productId").patch(verifyJWT, isAdmin, updateProduct);
router.route("/:productId").delete(verifyJWT, isAdmin, deleteProduct);

export default router;
