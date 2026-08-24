const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

router.use(requireAuth);

const categoryValidation = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color must be a valid hex color"),
];

const updateCategoryValidation = [
  body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color must be a valid hex color"),
];

router.get("/", getCategories);
router.post("/", categoryValidation, validate, createCategory);
router.patch("/:id", updateCategoryValidation, validate, updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
