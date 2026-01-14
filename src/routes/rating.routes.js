import { Router } from "express";
import {
  addReview,
  updateReview, 
  deleteReview,
  getProductReviews,
} from "../controllers/rating.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/:productId").post(verifyJWT, addReview);
router.route("/:productId").get(verifyJWT, getProductReviews);
router.route("/:ratingId").delete(verifyJWT, deleteReview);
router.route("/:ratingId").patch(verifyJWT, updateReview);

export default router;
