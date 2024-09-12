// models/Payroll.js

import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  bonus: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  payment_date: {
    type: Date,
    required: true,
  },
});

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;