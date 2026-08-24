const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budget.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

router.use(requireAuth);

const budgetValidation = [
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be 0 or greater"),
  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12"),
  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be between 2000 and 2100"),
];

const updateBudgetValidation = [
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be 0 or greater"),
];

router.post("/", budgetValidation, validate, createBudget);
router.get("/", getBudgets);
router.get("/:id", getBudget);
router.patch("/:id", updateBudgetValidation, validate, updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
