import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Payment } from "../models/payment.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.models.js";
import crypto from "crypto";
import mongoose from "mongoose"

const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentProvider, currency = "INR" } = req.body;

  if (!paymentProvider) {
    throw new ApiError(400, "Invalid  or paymentProvider");
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus === "SUCCESS") {
    throw new ApiError(404, "payment successed and completed");
  }

  const gatWays = ["RAZORPAY", "STRIPE", "PAYPAL", "PHONEPE"];
  if (!gatWays.includes(paymentProvider)) {
    throw new ApiError(400, "Unsupported payment provider");
  }

  const isPayment = await Payment.findOne({ order: order._id });

  if (isPayment) {
    throw new ApiError(400, "Payment already initiated for this order");
  }

  const payment = await Payment.create({
    user: req.user._id,
    order: order._id,
    amount: order.totalAmount,
    status: "PENDING",
    providerPaymentId,
    paymentProvider,
    currency,
  });

  if (!payment) {
    throw new ApiError(404, "payment not created");
  }

  order.paymentStatus = "PENDING";

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment initiated successfully"));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { providerPaymentId, providerOrderId, signature } = req.body;

  if (!providerPaymentId || !providerOrderId || !signature) {
    throw new ApiError(400, "Invalid payment verification data");
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const payment = await Payment.findOne({
    order: orderId,
    user: req.user._id,
    providerPaymentId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  if (payment.status === "SUCCESS") {
    throw new ApiError(400, "Payment already verified");
  }

  const body = `${providerOrderId}|${providerPaymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.PAYMENT_SECRET_KEY)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    payment.status = "FAILED";
    await payment.save();
    throw new ApiError(400, "Payment verification failed");
  }

  payment.status = "SUCCESS";
  await payment.save();

  const order = await Order.findById(orderId);
  order.paymentStatus = "SUCCESS";
  order.isPaid = true;
  order.paidAt = new Date();
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment verified successfully"));
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new ApiError(400, "Invalid payment id");
  }

  const payment = await Payment.findOne({
    _id: paymentId,
    user: req.user._id,
  });

  if (!payment) {
    throw new ApiError(404, "payment not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: payment.status },
        "Payment status fetched successfully"
      )
    );
});

export { initiatePayment, verifyPayment, getPaymentStatus };
