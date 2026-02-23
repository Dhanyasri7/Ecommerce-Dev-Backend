const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =======================
// 🔹 SIGNUP
// =======================
exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Error creating user" });
            }

           
            const token = jwt.sign(
              {
                email,
                name
              },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );

            res.json({
              message: "Signup successful",
              token
            });
          }
        );
      } catch (error) {
        console.error("Hash error:", error);
        res.status(500).json({ message: "Password hashing failed" });
      }
    }
  );
};

// =======================
// 🔹 LOGIN
// =======================
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!result || result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result[0];

      try {
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ message: "Invalid password" });
        }

        //  Token now includes name
        const token = jwt.sign(
          {
            email: user.email,
            name: user.name
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.json({
          message: "Login successful",
          token
        });

      } catch (error) {
        console.error("Bcrypt error:", error);
        res.status(500).json({ message: "Error comparing password" });
      }
    }
  );
};