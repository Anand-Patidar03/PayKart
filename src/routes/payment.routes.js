import { Router } from "express";
import {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
} from "../controllers/payment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/initiate/:orderId").get(verifyJWT, initiatePayment);
router.route("/verify/:orderId").patch(verifyJWT, verifyPayment);
router.route("/:paymentId").patch(verifyJWT, getPaymentStatus);

export default router;
