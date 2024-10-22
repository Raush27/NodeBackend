import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    leave_type: { type: String, required: true },
    reason: { type: String, required: true },  // Added reason field
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    remarks: { type: String, default: "" },  // Added remarks field
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
