const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

// All routes require authentication
router.use(requireAuth);

const transactionValidation = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 150 })
    .withMessage("Description cannot exceed 150 characters"),
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

const updateValidation = [
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .isLength({ max: 150 })
    .withMessage("Description cannot exceed 150 characters"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

router.post("/", transactionValidation, validate, createTransaction);
router.get("/", getTransactions);
router.get("/:id", getTransaction);
router.patch("/:id", updateValidation, validate, updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
