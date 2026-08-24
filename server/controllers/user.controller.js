const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currency, theme, avatar } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase();
  if (currency !== undefined) updateData.currency = currency;
  if (theme !== undefined) updateData.theme = theme;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return new ApiResponse(200, "Profile updated successfully", user).send(res);
});

// @desc    Change user password
// @route   PATCH /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  // Get user with password (select: false by default)
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Assign new password; pre-save hook will hash it
  user.password = newPassword;
  await user.save();

  return new ApiResponse(200, "Password changed successfully", null).send(res);
});

// @desc    Delete user account and all associated data
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete all user data in parallel
  await Promise.all([
    Transaction.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Category.deleteMany({ userId, isDefault: false }),
    User.findByIdAndDelete(userId),
  ]);

  // Clear auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return new ApiResponse(200, "Account deleted successfully", null).send(res);
});

module.exports = { updateProfile, changePassword, deleteAccount };
