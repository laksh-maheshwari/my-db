const express = require("express");
const cors = require("cors");
const pool = require("../config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 1️⃣ Get all employees
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Get employee by id
app.get("/employees/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(`SELECT * FROM employees WHERE id = ${id}`);
    if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Add new employee
app.post("/employees", async (req, res) => {
  const emp = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO employees (first_name, last_name, email, phone, department, salary, joining_date)
      VALUES ('${emp.first_name}', '${emp.last_name}', '${emp.email}', '${emp.phone}', '${emp.department}', ${emp.salary}, '${emp.joining_date}')
      RETURNING *
    `);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Update employee
app.put("/employees/:id", async (req, res) => {
  const id = req.params.id;
  const emp = req.body;
  try {
    const result = await pool.query(`
      UPDATE employees
      SET first_name='${emp.first_name}', last_name='${emp.last_name}', email='${emp.email}', phone='${emp.phone}', department='${emp.department}', salary=${emp.salary}, joining_date='${emp.joining_date}'
      WHERE id=${id} RETURNING *
    `);
    if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ Delete employee
app.delete("/employees/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(`DELETE FROM employees WHERE id=${id} RETURNING *`);
    if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted successfully", employee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Departments (Read only)
app.get("/departments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
