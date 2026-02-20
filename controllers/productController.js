const db = require("../config/db");


exports.addProductsBulk = (req, res) => {
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

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Bulk insert error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({
      message: "Bulk products inserted successfully",
      insertedRows: result.affectedRows,
    });
  });
};



exports.getProductsByCategory = (req, res) => {
  const { catid } = req.params;

  const sql = `
    SELECT * FROM products
    WHERE catid = ?
    ORDER BY proid DESC
  `;

  db.query(sql, [catid], (err, result) => {
    if (err) {
      console.error("Fetch by category error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
};



exports.getAllProducts = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // 12 per page
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM products";
  const dataQuery = `
    SELECT * FROM products
    ORDER BY proid DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    db.query(dataQuery, [limit, offset], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });

      res.json({
        currentPage: page,
        totalPages,
        totalProducts,
        products: result,
      });
    });
  });
};

