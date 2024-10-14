import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Reference to the Employee model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "On Leave"], // Different attendance statuses
    required: true,
  },
  remarks: {
    type: String,
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
