const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/jwt");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already in use
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  const userObj = user.toJSON();
  userObj.token = token;

  return new ApiResponse(201, "Registration successful", userObj).send(res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Must select password because select: false on schema
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  // Remove password from response and return token
  const userObj = user.toJSON();
  userObj.token = token;
  return new ApiResponse(200, "Login successful", userObj).send(res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return new ApiResponse(200, "Logged out successfully", null).send(res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  return new ApiResponse(200, "User fetched successfully", req.user).send(res);
});

module.exports = { register, login, logout, getMe };
