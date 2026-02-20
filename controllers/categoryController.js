const db = require("../config/db");

exports.getCategories = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM categories";
  const dataQuery = `
    SELECT * FROM categories
    ORDER BY catid ASC
    LIMIT ? OFFSET ?
  `;

  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const totalCategories = countResult[0].total;
    const totalPages = Math.ceil(totalCategories / limit);

    db.query(dataQuery, [limit, offset], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });

      res.json({
        currentPage: page,
        totalPages,
        totalCategories,
        categories: result,
      });
    });
  });
};


exports.addCategory = (req, res) => {
  const categories = req.body;

  if (!Array.isArray(categories)) {
    return res.status(400).json({ message: "Send data as array" });
  }

  const values = categories.map(cat => [
    cat.catname,
    cat.description
  ]);

  db.query(
    "INSERT INTO categories (catname, description) VALUES ?",
    [values],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        message: "Bulk categories inserted",
        insertedRows: result.affectedRows
      });
    }
  );
};
