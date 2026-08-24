const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Helper: calculate spent for a budget
const calculateSpent = async (budget, month, year) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const matchStage = {
    userId: budget.userId,
    type: "expense",
    date: { $gte: startOfMonth, $lte: endOfMonth },
  };

  if (budget.category !== "Overall") {
    matchStage.category = budget.category;
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result[0]?.total || 0;
};

// @desc    Create a budget
// @route   POST /api/budgets
// @access  Private
const createBudget = asyncHandler(async (req, res) => {
  const { category, amount, month, year } = req.body;

  try {
    const budget = await Budget.create({
      userId: req.user._id,
      category,
      amount,
      month,
      year,
    });
    return new ApiResponse(201, "Budget created successfully", budget).send(res);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Budget for this category/month/year already exists");
    }
    throw error;
  }
});

// @desc    Get budgets (with spending data)
// @route   GET /api/budgets?month=&year=
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
  const year = parseInt(req.query.year, 10) || now.getFullYear();

  const budgets = await Budget.find({ userId: req.user._id, month, year });

  const budgetsWithUsage = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await calculateSpent(budget, month, year);
      const remaining = Math.max(budget.amount - spent, 0);
      const percentageUsed = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;

      return {
        ...budget.toJSON(),
        spent,
        remaining,
        percentageUsed: parseFloat(percentageUsed.toFixed(2)),
      };
    })
  );

  return new ApiResponse(200, "Budgets fetched successfully", budgetsWithUsage).send(res);
});

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  const spent = await calculateSpent(budget, budget.month, budget.year);
  const remaining = Math.max(budget.amount - spent, 0);
  const percentageUsed = budget.amount > 0 ? parseFloat(((spent / budget.amount) * 100).toFixed(2)) : 0;

  return new ApiResponse(200, "Budget fetched successfully", {
    ...budget.toJSON(),
    spent,
    remaining,
    percentageUsed,
  }).send(res);
});

// @desc    Update a budget
// @route   PATCH /api/budgets/:id
// @access  Private
const updateBudget = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { amount },
    { new: true, runValidators: true }
  );

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  return new ApiResponse(200, "Budget updated successfully", budget).send(res);
});

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  return new ApiResponse(200, "Budget deleted successfully", null).send(res);
});

module.exports = { createBudget, getBudgets, getBudget, updateBudget, deleteBudget };
