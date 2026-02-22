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
router.get("/", verifyToken, getAllProducts);
router.get("/category/:catid", verifyToken, getProductsByCategory);
router.delete("/delete-all", verifyToken, deleteAllProducts);

module.exports = router;