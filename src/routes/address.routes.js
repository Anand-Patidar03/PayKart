import { Router } from "express";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "../controllers/address.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, addAddress);
router.route("/:addressId").delete(verifyJWT, deleteAddress);
router.route("/").get(verifyJWT, getAddresses);
router.route("/:addressId").patch(verifyJWT, setDefaultAddress);
router.route("/update/:addressId").patch(verifyJWT, updateAddress);

export default router;
