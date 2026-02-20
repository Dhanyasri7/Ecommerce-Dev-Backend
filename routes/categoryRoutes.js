const express = require("express");
const router = express.Router();
const { getCategories, addCategory } = require("../controllers/categoryController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, addCategory);

module.exports = router;
