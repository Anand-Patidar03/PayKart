import { Router } from "express";
import {
  addToCart,
  removeFromCart,
  updateCart,
  getCart, 
  clearCart,
} from "../controllers/cart.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, addToCart);
router.route("/").get(verifyJWT, getCart);
router.route("/:productId").delete(verifyJWT, removeFromCart);
router.route("/").patch(verifyJWT, updateCart);
router.route("/").delete(verifyJWT, clearCart);

export default router;
