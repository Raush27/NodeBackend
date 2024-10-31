import express from 'express';
import Employee from "../models/Employee.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/employee_login", async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.body.email });

    if (!employee) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }

    if (employee.status !== "active") {
      return res.json({ loginStatus: false, Error: "Account is not active. Please contact support." });
    }
    const passwordMatch = await bcrypt.compare(req.body.password, employee.password);
    if (!passwordMatch) {
      return res.json({ loginStatus: false, Error: "Wrong Password" });
    }
    const token = jwt.sign(
      { role: "employee", email: employee.email, id: employee._id },
      "jwt_secret_key",
      { expiresIn: "1d" }
    );
    res.cookie('token', token);

    return res.json({ loginStatus: true, id: employee._id });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ loginStatus: false, Error: "An error occurred. Please try again later." });
  }
});


router.get('/detail/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('-password') // Exclude the password field
      .populate('category_id'); // Populate category data

    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch employee details' });
  }
});



router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: true });
});

export { router as EmployeeRouter };
