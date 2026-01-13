import { Router } from "express";
import {
  createOrder,
  getuserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, createOrder);
router.route("/").get(verifyJWT, getuserOrders);
router.route("/:orderId").get(verifyJWT, getOrderById);
router.route("/getAll/").get(verifyJWT,isAdmin, getAllOrders);
router.route("/:orderId").patch(verifyJWT,isAdmin, updateOrderStatus);
router.route("/cancel/:orderId").patch(verifyJWT, cancelOrder);

export default router;
