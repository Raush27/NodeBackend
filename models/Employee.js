import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String,  },
  email: { type: String, unique: true },
  password: { type: String,  },
  address: { type: String,  },
  salary: { type: Number,  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  }, // Referencing Category model
  image: { type: String, },
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
