const db = require("../config/db");

// =======================
// 🔹 GET CATEGORIES (Paginated)
// =======================
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      "SELECT COUNT(*) AS total FROM categories"
    );

    const totalCategories = countResult[0].total;
    const totalPages = Math.ceil(totalCategories / limit);

    const [rows] = await db.query(
      `
      SELECT * FROM categories
      ORDER BY catid ASC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    res.json({
      currentPage: page,
      totalPages,
      totalCategories,
      categories: rows,
    });

  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Database error" });
  }
};


// =======================
// 🔹 ADD CATEGORY (Bulk)
// =======================
exports.addCategory = async (req, res) => {
  try {
    const categories = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: "Send data as array" });
    }

    const values = categories.map(cat => [
      cat.catname,
      cat.description
    ]);

    await db.query(
      "INSERT INTO categories (catname, description) VALUES ?",
      [values]
    );

    res.status(201).json({
      message: "Bulk categories inserted",
      insertedRows: values.length
    });

  } catch (error) {
    console.error("Add category error:", error);
    res.status(500).json({ message: "Database error" });
  }
};