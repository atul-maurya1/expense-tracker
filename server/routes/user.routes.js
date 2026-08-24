const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { updateProfile, changePassword, deleteAccount } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

router.use(requireAuth);

const profileValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("theme")
    .optional()
    .isIn(["light", "dark", "system"])
    .withMessage("Theme must be light, dark, or system"),
];

const passwordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

router.patch("/profile", profileValidation, validate, updateProfile);
router.patch("/change-password", passwordValidation, validate, changePassword);
router.delete("/account", deleteAccount);

module.exports = router;
