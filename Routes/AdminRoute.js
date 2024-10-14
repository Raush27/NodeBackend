import express from "express";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js"; // Assuming you have an Employee model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import Category from "../models/Category.js";
import Payroll from "../models/Payroll.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

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

router.post("/add_payroll", async (req, res) => {
  const { employee_id, salary, bonus, deductions, payment_date } = req.body;

  // Validate required fields
  if (!employee_id || !salary || !payment_date) {
    return res.status(400).json({
      Status: false,
      Error: "Employee ID, Salary, and Payment Date are required fields",
    });
  }

  try {
    // Parse the payment date
    const paymentDate = new Date(payment_date);
    const startOfMonth = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth() + 1,
      0
    );

    // Check if payroll exists for the same employee and the same month
    const existingPayroll = await Payroll.findOne({
      employee_id, // Check for the same employee
      payment_date: {
        $gte: startOfMonth, // Start of the month
        $lte: endOfMonth, // End of the month
      },
    });

    if (existingPayroll) {
      return res.status(400).json({
        Status: false,
        Error:
          "Payroll for this employee has already been added for this month.",
      });
    }

    // Create a new payroll entry
    const newPayroll = new Payroll({
      employee_id,
      salary,
      bonus: bonus || 0,
      deductions: deductions || 0,
      payment_date: paymentDate,
    });

    // Save the payroll entry to the database
    await newPayroll.save();

    res.status(201).json({
      Status: true,
      Message: "Payroll added successfully",
      Payroll: newPayroll,
    });
  } catch (error) {
    console.error("Error adding payroll:", error.message);
    res.status(500).json({
      Status: false,
      Error: "An error occurred while adding payroll. Please try again later.",
    });
  }
});
// Get All Payrolls Route
router.get("/payrolls", async (req, res) => {
  try {
    // Fetch all payroll entries from the database
    const payrolls = await Payroll.find().populate("employee_id", "name email");

    // If no payrolls found
    if (!payrolls || payrolls.length === 0) {
      return res.status(404).json({
        Status: false,
        Error: "No payrolls found",
      });
    }

    // Return the list of payrolls
    return res.status(200).json({
      Status: true,
      Message: "Payrolls retrieved successfully",
      Result: payrolls,
    });
  } catch (error) {
    // Catch server errors
    return res.status(500).json({
      Status: false,
      Error: "Server error while retrieving payrolls",
      Details: error.message,
    });
  }
});

router.get("/payroll", async (req, res) => {
  const { employee_id } = req.query;
  try {
    if (!employee_id) {
      return res.status(400).json({
        Status: false,
        Error: "employee_id query parameter is required",
      });
    }

    const payrolls = await Payroll.find({ employee_id }).populate(
      "employee_id",
      "name email designation department"
    );

    if (!payrolls || payrolls.length === 0) {
      return res.status(404).json({
        Status: false,
        Error: "No payrolls found for the given employee_id",
      });
    }

    return res.status(200).json({
      Status: true,
      Message: "Payrolls retrieved successfully",
      Result: payrolls,
    });
  } catch (error) {
    return res.status(500).json({
      Status: false,
      Error: "Server error while retrieving payrolls",
      Details: error.message,
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

// Mark employee attendance
router.post("/mark_attendance", async (req, res) => {
  const { employee_id, date, status, remarks } = req.body;

  // Input validation
  if (!employee_id || !date || !status) {
    return res.status(400).json({
      Status: false,
      Error: "Employee ID, Date, and Status are required fields.",
    });
  }

  try {
    // Check if attendance for this employee on this date already exists
    const attendanceExists = await Attendance.findOne({
      employee_id,
      date: new Date(date).setHours(0, 0, 0, 0), // Check for exact date
    });

    if (attendanceExists) {
      return res.status(400).json({
        Status: false,
        Error:
          "Attendance for this employee has already been marked for this date.",
      });
    }

    // Create a new attendance entry
    const newAttendance = new Attendance({
      employee_id,
      date: new Date(date).setHours(0, 0, 0, 0), // Ensure time is normalized to the start of the day
      status,
      remarks: remarks || "", // Optional remarks
    });

    // Save attendance to the database
    await newAttendance.save();

    return res.status(201).json({
      Status: true,
      Message: "Attendance marked successfully",
      Attendance: newAttendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      Status: false,
      Error:
        "An error occurred while marking attendance. Please try again later.",
    });
  }
});
router.get("/attendance_report", async (req, res) => {
  try {
    // Fetch all attendance records and populate the employee details
    const attendanceRecords = await Attendance.find()
      .populate("employee_id", "name designation email") // Populate employee details
      .sort({ date: -1 }); // Sort by date, newest first

    // Check if any records are found
    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No attendance records found.",
      });
    }

    // Return the found records with employee data
    return res.status(200).json({
      status: true,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    return res.status(500).json({
      status: false,
      error:
        "An error occurred while fetching the attendance report. Please try again later.",
    });
  }
});

router.get("/attendance_report/:employee_id", async (req, res) => {
  const { employee_id } = req.params;
  const { start_date, end_date } = req.query;
  if (!employee_id) {
    return res.status(400).json({
      Status: false,
      Error: "Employee ID is required.",
    });
  }
  try {
    const query = {
      employee_id,
    };
    if (start_date && end_date) {
      query.date = {
        $gte: new Date(new Date(start_date).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(end_date).setHours(23, 59, 59, 999)),
      };
    }
    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });
    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        Status: false,
        Message: "No attendance records found for this employee.",
      });
    }

    return res.status(200).json({
      status: true,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    return res.status(500).json({
      Status: false,
      Error:
        "An error occurred while fetching the attendance report. Please try again later.",
    });
  }
});

// Create a new leave request
router.post("/apply_leave", async (req, res) => {
  const { employee_id, start_date, end_date, leave_type } = req.body;

  // Validate input
  if (!employee_id || !start_date || !end_date || !leave_type) {
    return res.status(400).json({
      Status: false,
      Error: "Employee ID, Start Date,leave_type, and End Date are required.",
    });
  }

  try {
    const newLeave = new Leave({
      employee_id,
      start_date,
      end_date,
      leave_type,
    });
    await newLeave.save();

    return res.status(201).json({
      Status: true,
      Message: "Leave request created successfully",
      Leave: newLeave,
    });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: error.message });
  }
});

// Get all leave requests (Admin only)
router.get("/leave", async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee_id", "name email");
    return res.json({ Status: true, Result: leaves });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: error.message });
  }
});
router.get("/leave/:employee_id", async (req, res) => {
  try {
    const { employee_id } = req.params;
    const leaves = await Leave.find({ employee_id }).populate(
      "employee_id",
      "name email"
    );

    if (leaves.length === 0) {
      return res.json({
        Status: false,
        Error: "No leave records found for this employee.",
      });
    }

    return res.json({ Status: true, Result: leaves });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: error.message });
  }
});

// Accept a leave request
router.put("/leave/accept/:id", async (req, res) => {
  const { remarks } = req.body;

  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", remarks },
      { new: true, runValidators: true }
    );

    if (!updatedLeave) {
      return res
        .status(404)
        .json({ Status: false, Error: "Leave request not found" });
    }

    return res.json({ Status: true, Result: updatedLeave });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: error.message });
  }
});

// Reject a leave request
router.put("/leave/reject/:id", async (req, res) => {
  const { remarks } = req.body;

  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", remarks },
      { new: true, runValidators: true }
    );

    if (!updatedLeave) {
      return res
        .status(404)
        .json({ Status: false, Error: "Leave request not found" });
    }

    return res.json({ Status: true, Result: updatedLeave });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: error.message });
  }
});

export { router as adminRouter };
