const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date, notes } = req.body;

  const transaction = await Transaction.create({
    userId: req.user._id,
    type,
    amount,
    category,
    description,
    date: date || Date.now(),
    notes: notes || "",
  });

  return new ApiResponse(201, "Transaction created successfully", transaction).send(res);
});

// @desc    Get all transactions for a user (paginated, filtered)
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    search,
    startDate,
    endDate,
    sortBy = "date",
    sortOrder = "desc",
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter = { userId: req.user._id };

  if (type && ["income", "expense"].includes(type)) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  if (search) {
    filter.description = { $regex: search, $options: "i" };
  }

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [total, transactions] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);

  const pages = Math.ceil(total / limitNum);

  return new ApiResponse(200, "Transactions fetched successfully", {
    transactions,
    pagination: { page: pageNum, limit: limitNum, total, pages },
  }).send(res);
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return new ApiResponse(200, "Transaction fetched successfully", transaction).send(res);
});

// @desc    Update a transaction
// @route   PATCH /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date, notes } = req.body;

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { type, amount, category, description, date, notes },
    { new: true, runValidators: true }
  );

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return new ApiResponse(200, "Transaction updated successfully", transaction).send(res);
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return new ApiResponse(200, "Transaction deleted successfully", null).send(res);
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
