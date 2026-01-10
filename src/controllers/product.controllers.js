import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Product } from "../models/product.models.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images } = req.body;
  if (!name || !description || !price || !category || !stock || !images) {
    throw new ApiError(400, "All fields are required");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images,
    createdBy: req.user?._id,
  });

  if (!product) {
    throw new ApiError(400, "Product not created");
  }

  if (!Array.isArray(images) || images.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort, category, priceRange } = req.query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;

  const filter = {
    isActive: true,
  };

  const sortBy = req.query.sort || "-createdAt";

  const product = await Product.find(filter).sort(sort).limit(limitNumber);

  if (req.user?.role === "ADMIN") {
    product = product.populate("createdBy", "fullName email");
  }

  const totalProducts = await Product.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
        totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
      },
      "All products fetched successfully"
    )
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const products = await Product.findById(productId);

  if (!products) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, images, category, stock } = req.body;

  if (!name && !description && !price && !images && !category && !stock) {
    throw new ApiError(400, "At least one field is required");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (stock) product.stock = stock;

  if (images) {
    if (!Array.isArray(images) || images.length === 0) {
      throw new ApiError(400, "Images must be a non-empty array");
    }
    product.images = images;
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findOneAndDelete(
    productId,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product deleted successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
