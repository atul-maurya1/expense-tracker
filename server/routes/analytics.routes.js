const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getAnalytics,
  getSpendingTrend,
} = require("../controllers/analytics.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.use(requireAuth);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/spending-trend", getSpendingTrend);

module.exports = router;
