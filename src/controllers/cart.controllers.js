import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Product } from "../models/product.models.js";
import { Cart } from "../models/cart.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    throw new ApiError(400, "All fields are required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [
        {
          product: productId,
          quantity,
          priceAtThatTime: product.price,
        },
      ],
      totalPrice: product.price * quantity,
    });
  } else {
    // update existing cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtThatTime: product.price,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.priceAtThatTime,
      0
    );

    await cart.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, cart, "Cart created successfully"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const userCart = await Cart.findOne({ user: req.user._id });
  if (!userCart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemidx = userCart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemidx === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  userCart.items.splice(itemidx, 1);

  userCart.totalPrice = userCart.items.reduce(
    (total, item) => total + item.quantity * item.priceAtThatTime,
    0
  );

  await userCart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, userCart, "Product removed from cart"));
});

const updateCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemidx = userCart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemidx === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.items[itemidx].quantity = quantity;

  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * item.priceAtThatTime,
    0
  );

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart updated successfully"));
});

const getCart = asyncHandler(async (req, res) => {

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
  
    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));

});

const clearCart = asyncHandler(async (req, res) => {

  const cart = await Cart.findOneAndDelete({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));

});

export { addToCart, removeFromCart, updateCart, getCart, clearCart };
