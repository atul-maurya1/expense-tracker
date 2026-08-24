const Transaction = require("../models/Transaction");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

// Helper: aggregate total by type for a user
const getTotal = async (userId, type, matchExtra = {}) => {
  const result = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type, ...matchExtra } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total || 0;
};

// Helper: month date range
const monthRange = (year, month) => ({
  $gte: new Date(year, month - 1, 1),
  $lte: new Date(year, month, 0, 23, 59, 59, 999),
});

// Helper: get spending trend for a specific period
const getTrendForPeriod = async (uid, period) => {
  const now = new Date();
  let startDate = new Date();
  const periodLower = period.toLowerCase();
  
  if (periodLower === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (periodLower === "30d") {
    startDate.setDate(now.getDate() - 30);
  } else if (periodLower === "3m") {
    startDate.setMonth(now.getMonth() - 3);
  } else if (periodLower === "6m") {
    startDate.setMonth(now.getMonth() - 6);
  } else if (periodLower === "1y") {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    startDate.setDate(now.getDate() - 30);
  }
  
  startDate.setHours(0, 0, 0, 0);

  const dailyRaw = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(uid),
        type: "expense",
        date: { $gte: startDate, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  return dailyRaw.map((d) => ({
    date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
    amount: d.amount,
  }));
};

// @desc    Get dashboard data
// @route   GET /api/analytics/dashboard?month=&year=
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const uid = req.user._id;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  // All-time totals
  const [totalIncome, totalExpenses] = await Promise.all([
    getTotal(uid, "income"),
    getTotal(uid, "expense"),
  ]);
  const totalBalance = totalIncome - totalExpenses;

  // Monthly totals (selected month)
  const [monthlyIncome, monthlyExpenses] = await Promise.all([
    getTotal(uid, "income", { date: monthRange(year, month) }),
    getTotal(uid, "expense", { date: monthRange(year, month) }),
  ]);

  // Previous month totals (for % change)
  const [previousMonthIncome, previousMonthExpenses] = await Promise.all([
    getTotal(uid, "income", { date: monthRange(prevYear, prevMonth) }),
    getTotal(uid, "expense", { date: monthRange(prevYear, prevMonth) }),
  ]);

  // Recent transactions
  const recentTransactions = await Transaction.find({ userId: uid })
    .sort({ date: -1 })
    .limit(5);

  // Last 12 months data
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRaw = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(uid), date: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Format monthly data into a unified array
  const monthlyMap = {};
  monthlyRaw.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { month: key, year: _id.year, monthNum: _id.month, income: 0, expense: 0 };
    }
    monthlyMap[key][_id.type] = total;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Category distribution for selected month
  const categoryRaw = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(uid),
        type: "expense",
        date: monthRange(year, month),
      },
    },
    { $group: { _id: "$category", amount: { $sum: "$amount" } } },
    { $sort: { amount: -1 } },
  ]);

  const totalCategoryAmount = categoryRaw.reduce((sum, c) => sum + c.amount, 0);
  const categoryData = categoryRaw.map((c) => ({
    category: c._id,
    amount: c.amount,
    percentage:
      totalCategoryAmount > 0
        ? parseFloat(((c.amount / totalCategoryAmount) * 100).toFixed(2))
        : 0,
  }));

  // Calculate trends for all periods
  const [trend7D, trend30D, trend3M, trend6M, trend1Y] = await Promise.all([
    getTrendForPeriod(uid, "7d"),
    getTrendForPeriod(uid, "30d"),
    getTrendForPeriod(uid, "3m"),
    getTrendForPeriod(uid, "6m"),
    getTrendForPeriod(uid, "1y"),
  ]);

  const spendingTrend = {
    "7D": trend7D,
    "30D": trend30D,
    "3M": trend3M,
    "6M": trend6M,
    "1Y": trend1Y,
  };

  return new ApiResponse(200, "Dashboard data fetched successfully", {
    totalIncome,
    totalExpenses,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    previousMonthIncome,
    previousMonthExpenses,
    recentTransactions,
    monthlyData,
    categoryData,
    spendingTrend,
  }).send(res);
});

// @desc    Get analytics data
// @route   GET /api/analytics/analytics?startDate=&endDate=
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }
  const dateMatch = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

  const [totalIncome, totalExpenses] = await Promise.all([
    getTotal(uid, "income", dateMatch),
    getTotal(uid, "expense", dateMatch),
  ]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? parseFloat(((netSavings / totalIncome) * 100).toFixed(2)) : 0;

  // Average daily / monthly spending
  const expenseTransactions = await Transaction.find({
    userId: uid,
    type: "expense",
    ...dateMatch,
  }).sort({ date: 1 });

  let avgDailySpending = 0;
  let avgMonthlySpending = 0;

  if (expenseTransactions.length > 0) {
    const firstDate = expenseTransactions[0].date;
    const lastDate = expenseTransactions[expenseTransactions.length - 1].date;
    const days = Math.max(
      Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1,
      1
    );
    avgDailySpending = parseFloat((totalExpenses / days).toFixed(2));
    const months = Math.max(Math.ceil(days / 30), 1);
    avgMonthlySpending = parseFloat((totalExpenses / months).toFixed(2));
  }

  // Highest expense transaction
  const highestExpense = await Transaction.findOne({
    userId: uid,
    type: "expense",
    ...dateMatch,
  }).sort({ amount: -1 });

  // Top category
  const topCategoryRaw = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(uid), type: "expense", ...dateMatch } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);
  const topCategory = topCategoryRaw[0] || null;

  // Monthly data (income vs expense)
  const monthlyRaw = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(uid), ...dateMatch } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyMap = {};
  monthlyRaw.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = { month: key, income: 0, expense: 0 };
    }
    monthlyMap[key][_id.type] = total;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // Category distribution
  const categoryRaw = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(uid), type: "expense", ...dateMatch } },
    { $group: { _id: "$category", amount: { $sum: "$amount" } } },
    { $sort: { amount: -1 } },
  ]);
  const totalCatAmount = categoryRaw.reduce((s, c) => s + c.amount, 0);
  const categoryDistribution = categoryRaw.map((c) => ({
    category: c._id,
    amount: c.amount,
    percentage: totalCatAmount > 0 ? parseFloat(((c.amount / totalCatAmount) * 100).toFixed(2)) : 0,
  }));

  // Daily spending trend
  const dailyRaw = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(uid), type: "expense", ...dateMatch } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" }, day: { $dayOfMonth: "$date" } },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
  const spendingTrend = dailyRaw.map((d) => ({
    date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
    amount: d.amount,
  }));

  // Monthly savings trend
  const savingsTrend = monthlyData.map((m) => ({
    month: m.month,
    savings: m.income - m.expense,
  }));

  return new ApiResponse(200, "Analytics fetched successfully", {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    avgDailySpending,
    avgMonthlySpending,
    highestExpense,
    topCategory,
    monthlyData,
    categoryDistribution,
    spendingTrend,
    savingsTrend,
  }).send(res);
});

// @desc    Get spending trend for a period
// @route   GET /api/analytics/spending-trend?period=7d|30d|3m|6m|1y
// @access  Private
const getSpendingTrend = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const { period = "30d" } = req.query;

  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "3m":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  startDate.setHours(0, 0, 0, 0);

  const dailyRaw = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(uid),
        type: "expense",
        date: { $gte: startDate, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const trend = dailyRaw.map((d) => ({
    date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
    amount: d.amount,
    count: d.count,
  }));

  return new ApiResponse(200, "Spending trend fetched successfully", { period, trend }).send(res);
});

module.exports = { getDashboard, getAnalytics, getSpendingTrend };
