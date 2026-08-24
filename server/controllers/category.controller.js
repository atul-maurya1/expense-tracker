const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining",    type: "expense", color: "#f97316", icon: "UtensilsCrossed",  isDefault: true },
  { name: "Transportation",   type: "expense", color: "#3b82f6", icon: "Car",              isDefault: true },
  { name: "Shopping",         type: "expense", color: "#ec4899", icon: "ShoppingBag",       isDefault: true },
  { name: "Bills & Utilities",type: "expense", color: "#8b5cf6", icon: "Zap",              isDefault: true },
  { name: "Entertainment",    type: "expense", color: "#f59e0b", icon: "Tv",               isDefault: true },
  { name: "Healthcare",       type: "expense", color: "#10b981", icon: "Heart",            isDefault: true },
  { name: "Education",        type: "expense", color: "#6366f1", icon: "BookOpen",         isDefault: true },
  { name: "Travel",           type: "expense", color: "#14b8a6", icon: "Plane",            isDefault: true },
  { name: "Groceries",        type: "expense", color: "#84cc16", icon: "ShoppingCart",     isDefault: true },
  { name: "Subscriptions",    type: "expense", color: "#a855f7", icon: "RefreshCw",        isDefault: true },
  { name: "Other",            type: "expense", color: "#6b7280", icon: "MoreHorizontal",   isDefault: true },
  { name: "Salary",           type: "income",  color: "#10b981", icon: "Briefcase",        isDefault: true },
  { name: "Freelance",        type: "income",  color: "#3b82f6", icon: "Laptop",           isDefault: true },
  { name: "Business",         type: "income",  color: "#f59e0b", icon: "Building2",        isDefault: true },
  { name: "Investment",       type: "income",  color: "#6366f1", icon: "TrendingUp",       isDefault: true },
  { name: "Gift",             type: "income",  color: "#ec4899", icon: "Gift",             isDefault: true },
  { name: "Other",            type: "income",  color: "#6b7280", icon: "MoreHorizontal",   isDefault: true },
];

// Seed default categories (called on startup)
const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true });
    if (count === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log("Default categories seeded");
    }
  } catch (error) {
    console.error("Failed to seed default categories:", error.message);
  }
};

// @desc    Get all categories (default + user)
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    $or: [{ userId: req.user._id }, { isDefault: true }],
  }).sort({ type: 1, name: 1 });

  return new ApiResponse(200, "Categories fetched successfully", categories).send(res);
});

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon, color } = req.body;

  const category = await Category.create({
    userId: req.user._id,
    name,
    type,
    icon: icon || "",
    color: color || "#6366f1",
    isDefault: false,
  });

  return new ApiResponse(201, "Category created successfully", category).send(res);
});

// @desc    Update a custom category
// @route   PATCH /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const { name, icon, color } = req.body;

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDefault: false },
    { name, icon, color },
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new ApiError(404, "Category not found or cannot update default category");
  }

  return new ApiResponse(200, "Category updated successfully", category).send(res);
});

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
    isDefault: { $ne: true },
  });

  if (!category) {
    throw new ApiError(404, "Category not found or cannot delete default category");
  }

  return new ApiResponse(200, "Category deleted successfully", null).send(res);
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, seedDefaultCategories };
