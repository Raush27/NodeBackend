import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String,  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
