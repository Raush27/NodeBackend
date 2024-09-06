import express from "express";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js"; // Assuming you have an Employee model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import Category from "../models/Category.js";

const router = express.Router();

// Admin login route
router.post("/adminlogin", async (req, res) => {
  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email: req.body.email });

    if (admin) {
      // Compare provided password with hashed password in database
      const isMatch = await bcrypt.compare(req.body.password, admin.password);

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign(
          { role: "admin", email: admin.email, id: admin._id },
          "jwt_secret_key",
          { expiresIn: "1d" }
        );
        // Set the token in a cookie
        res.cookie("token", token);
        return res.json({ loginStatus: true });
      } else {
        return res.json({
          loginStatus: false,
          Error: "Wrong email or password",
        });
      }
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }
  } catch (err) {
    return res.json({ loginStatus: false, Error: err.message });
  }
});

// Get all categories
router.get("/category", async (req, res) => {
  const categories = await Category.find();
  return res.json({ Status: true, Result: categories });
});

router.post("/add_category", async (req, res) => {
  const { category } = req.body;

  // Input validation
  if (!category || typeof category !== "string") {
    return res
      .status(400)
      .json({ Status: false, Error: "Invalid category name" });
  }

  try {
    // Create and save the new category
    const newCategory = new Category({ name: category });
    await newCategory.save();

    // Respond with success
    return res
      .status(201)
      .json({ Status: true, Message: "Category added successfully" });
  } catch (err) {
    // Respond with error message
    return res.status(500).json({ Status: false, Error: err.message });
  }
});

// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });
// Configure Multer for image uploads

router.post("/add_employee", upload.single("image"), async (req, res) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new employee
    const newEmployee = new Employee({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      address: req.body.address,
      salary: req.body.salary,
      image: req.file ? req.file.filename : undefined, // Handle image upload
      category_id: req.body.category_id,
    });

    // Save the new employee to the database
    await newEmployee.save();

    return res.json({ Status: true, Message: "Employee added successfully" });
  } catch (err) {
    console.error("Error adding employee:", err);
    return res.json({ Status: false, Error: err.message });
  }
});
router.get("/employee", async (req, res) => {
  try {
    const employees = await Employee.find().populate("category_id");
    return res.json({ Status: true, Result: employees });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Get employee by ID
router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "category_id"
    );
    if (!employee) {
      return res.json({ Status: false, Error: "Employee not found" });
    }
    return res.json({ Status: true, Result: employee });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Update employee by ID
router.put("/edit_employee/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.json({ Status: false, Error: "Employee not found" });
    }
    return res.json({ Status: true, Result: updatedEmployee });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Delete employee by ID
router.delete("/delete_employee/:id", async (req, res) => {
  try {
    const result = await Employee.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.json({ Status: false, Error: "Employee not found" });
    }
    return res.json({ Status: true, Result: result });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Get count of admins
router.get("/admin_count", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    return res.json({ Status: true, Result: { admin: count } });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Get count of employees
router.get("/employee_count", async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    return res.json({ Status: true, Result: { employee: count } });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Get total salary of employees
router.get("/salary_count", async (req, res) => {
  try {
    const totalSalary = await Employee.aggregate([
      { $group: { _id: null, salaryOFEmp: { $sum: "$salary" } } },
    ]);
    return res.json({ Status: true, Result: totalSalary[0] });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Get all admin records
router.get("/admin_records", async (req, res) => {
  try {
    const admins = await Admin.find();
    return res.json({ Status: true, Result: admins });
  } catch (err) {
    return res.json({ Status: false, Error: "Query Error: " + err.message });
  }
});

// Create a new admin
router.post("/create_admin", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newAdmin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await newAdmin.save();
    return res.json({ Status: "Admin created successfully", Admin: newAdmin });
  } catch (err) {
    return res.json({ Status: "Error", Error: err.message });
  }
});

// Create a new employee
router.post("/create_employee", upload.single("image"), async (req, res) => {
  try {
    const { name, email, password, address, salary, category_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      address,
      salary,
      category_id, // Ensure this is provided
      image: req.file.filename, // Image should be uploaded
    });

    await newEmployee.save();
    return res.json({
      Status: "Employee created successfully",
      Employee: newEmployee,
    });
  } catch (err) {
    return res.json({ Status: "Error", Error: err.message });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({Status: "Success"});
})

export { router as adminRouter };
