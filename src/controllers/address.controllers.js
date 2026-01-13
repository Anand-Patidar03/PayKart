import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Address } from "../models/address.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phoneNumber,
    street,
    city,
    state,
    pincode,
    country,
    isDefault = false,
  } = req.body;

  if (
    !fullName ||
    !phoneNumber ||
    !street ||
    !city ||
    !state ||
    !pincode ||
    !country
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const address = await Address.create({
    fullName,
    phoneNumber,
    street,
    city,
    state,
    pincode,
    country,
    isDefault,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(400, "Address not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    fullName,
    phoneNumber,
    street,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  if (
    !fullName ||
    !phoneNumber ||
    !street ||
    !city ||
    !state ||
    !pincode ||
    !country
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "Invalid address id");
  }

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  address.fullName = fullName;
  address.phoneNumber = phoneNumber;
  address.street = street;
  address.city = city;
  address.state = state;
  address.pincode = pincode;
  address.country = country;
  address.isDefault = isDefault;

  await address.save();

  return res 
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {

    const { addressId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(addressId))
    {
        throw new ApiError(400, "Invalid address id");
    }

    const address = await Address.findOneAndDelete({
        _id: addressId,
        user: req.user._id,
    });

    if(!address)
    {
        throw new ApiError(404, "Address not found");
    }

    return res 
        .status(200)
        .json(new ApiResponse(200, address, "Address deleted successfully"));

});

const getAddresses = asyncHandler(async (req, res) => {

    const addresses = await Address.find({ user: req.user._id });

    if(addresses.length === 0)
    {
        throw new ApiError(404, "Addresses not found");
    }

    return res 
        .status(200)
        .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));


});

const setDefaultAddress = asyncHandler(async (req, res) => {

    const { addressId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(addressId))
    {
        throw new ApiError(400, "Invalid address id");
    }

    const address = await Address.findOne({
        _id: addressId,
        user: req.user._id,
    });

    if(!address)
    {
        throw new ApiError(404, "Address not found");
    }

    address.isDefault = true;

    await address.save();

    return res 
        .status(200)
        .json(new ApiResponse(200, address, "Address set as default successfully"));

});

export {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
};
