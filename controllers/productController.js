const db = require("../config/db");

// =======================
// 🔹 BULK INSERT PRODUCTS
// =======================
exports.addProductsBulk = async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Send data as array" });
    }

    const values = products.map((p) => [
      p.proname,
      p.description,
      p.price,
      p.image,
      p.catid,
    ]);

    const sql = `
      INSERT INTO products 
      (proname, description, price, image, catid)
      VALUES ?
    `;

    const [result] = await db.query(sql, [values]);

    res.status(201).json({
      message: "Bulk products inserted successfully",
      insertedRows: result.affectedRows,
    });

  } catch (error) {
    console.error("Bulk insert error:", error);
    res.status(500).json({ message: "Database error" });
  }
};


// =======================
// 🔹 DELETE ALL PRODUCTS
// =======================
exports.deleteAllProducts = async (req, res) => {
  try {
    await db.query("TRUNCATE TABLE products");

    res.json({ message: "All products deleted successfully" });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};


// =======================
// 🔹 GET PRODUCTS BY CATEGORY
// =======================
exports.getProductsByCategory = async (req, res) => {
  try {
    const { catid } = req.params;

    const [rows] = await db.query(
      `
      SELECT * FROM products
      WHERE catid = ?
      ORDER BY proid DESC
      `,
      [catid]
    );

    res.json(rows);

  } catch (error) {
    console.error("Fetch by category error:", error);
    res.status(500).json({ message: "Database error" });
  }
};


// =======================
// 🔹 GET ALL PRODUCTS (Paginated)
// =======================
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    const [rows] = await db.query(
      `
      SELECT * FROM products
      ORDER BY proid DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    res.json({
      currentPage: page,
      totalPages,
      totalProducts,
      products: rows,
    });

  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Database error" });
  }
};