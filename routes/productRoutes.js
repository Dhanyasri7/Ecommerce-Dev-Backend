const express = require("express");
const router = express.Router();

const {
  addProductsBulk,
  getProductsByCategory,
  getAllProducts,
  deleteAllProducts
} = require("../controllers/productController");

const verifyToken = require("../middleware/authMiddleware");

// Protected routes
router.post("/", verifyToken, addProductsBulk);
router.delete("/delete-all", verifyToken, deleteAllProducts);

// Public routes
router.get("/", getAllProducts);
router.get("/category/:catid", getProductsByCategory);

module.exports = router;