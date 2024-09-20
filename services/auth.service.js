const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET ?? "jwtsecret";

async function loginHandler(req, res) {
  const { username, password } = req.body;

  console.log("Login attempt:", { username });

  let user = null;
  let role = null;

  const tryLoginAs = async (tableName, username, password) => {
    const results = await db.dbAsync(
      `SELECT * FROM ${tableName} WHERE username = ?`,
      [username]
    );

    if (!results || results.length == 0) return false;

    if (!bcrypt.compareSync(password, results[0].pass)) return false;

    user = results[0];
    role = tableName.slice(0, -1);

    return true;
  };

  try {
    if (
      !(await tryLoginAs("admins", username, password)) &&
      !(await tryLoginAs("teachers", username, password)) &&
      !(await tryLoginAs("students", username, password))
    ) {
      res.status(500).json({ success: false, message: "Invalid credentials" });
      return;
    }
  } catch (err) {
    console.log("login error: ", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
    return;
  }

  if (!user) {
    res.status(500).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ id: user.id, role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ success: true, token, user, role });
  return;
}

async function signupHandler(req, res) {
  const { name, username, password: plainPassword, role } = req.body;

  if (!name || !role || !username || !plainPassword) {
    return res.json({ success: false, message: "All fields are required." });
  }

  if (role != "admin" && role != "teacher" && role != "student") {
    return res.json({ success: false, message: "Invalid role." });
  }

  const tableName = role + "s";
  const password = bcrypt.hashSync(plainPassword, 10);

  const query = `INSERT INTO ${tableName} (name, username, pass) VALUES (?, ?, ?)`;

  try {
    await db.dbAsync(query, [name, username, password]);
    return res.status(201).json({ success: true });
  } catch (err) {
    if (err.code == "ER_DUP_ENTRY") {
      res
        .status(500)
        .json({ success: false, message: "Username already exists" });
      return;
    }

    console.log("signup error: ", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

async function jwtMiddlewareHandler(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parts = authHeader.split(" ");
  if (!parts.length === 2) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.userId = data.id;
    req.role = data.role;
    next();
  });
}

module.exports = { loginHandler, signupHandler, jwtMiddlewareHandler };
