import express from 'express';
import Employee from "../models/Employee.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/employee_login", async (req, res) => {
  const employee = await Employee.findOne({ email: req.body.email });

  if (employee) {
    const passwordMatch = await bcrypt.compare(req.body.password, employee.password);
    if (passwordMatch) {
      const token = jwt.sign({ role: "employee", email: employee.email, id: employee._id }, "jwt_secret_key", { expiresIn: "1d" });
      res.cookie('token', token);
      return res.json({ loginStatus: true, id: employee._id });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong Password" });
    }
  } else {
    return res.json({ loginStatus: false, Error: "Wrong email or password" });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('category_id');
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
