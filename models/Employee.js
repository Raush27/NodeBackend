import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  address: { type: String },
  salary: { type: Number },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  image: { type: String },

  status: {
    type: String,
    enum: ["active", "deactive"],
    default: "active",
  },
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
