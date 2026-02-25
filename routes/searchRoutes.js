const express = require("express");
const router = express.Router();

const {
  searchProducts,
  syncProductsToElastic
} = require("../controllers/searchController");

router.get("/", searchProducts);
router.get("/sync-products", syncProductsToElastic);

module.exports = router;