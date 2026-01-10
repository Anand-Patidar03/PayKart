import { ApiError } from "../utils/ApiError.js";

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Admin access required");
  }
  next();
});
