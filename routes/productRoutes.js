const express = require("express");
const router = express.Router();
const { addProductsBulk, getProductsByCategory, getAllProducts, } = require("../controllers/productController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, addProductsBulk);

router.get("/", verifyToken, getAllProducts);

router.get("/category/:catid", verifyToken, getProductsByCategory);

module.exports = router;
