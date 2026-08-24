const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Access denied. No token provided.");
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, "User not found. Token is invalid.");
  }

  req.user = user;
  next();
});

module.exports = { requireAuth };
