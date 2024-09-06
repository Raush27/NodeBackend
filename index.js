import express from 'express';
import cors from 'cors';
import { adminRouter } from './Routes/AdminRoute.js';
import { EmployeeRouter } from './Routes/EmployeeRoute.js';
import Jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';

const app = express();
connectDB(); // Connect to MongoDB

app.use(cors(
  {
      origin: ["http://localhost:5173"],
      methods: ["POST", "GET", "PUT"],
      credentials: true
  }
));

app.use(express.json());
app.use(cookieParser());
app.use('/auth', adminRouter);
app.use('/employee', EmployeeRouter);
app.use(express.static('Public'));

// Middleware to verify user authentication
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        Jwt.verify(token, 'jwt_secret_key', (err, decoded) => {
            if (err) return res.status(401).json({ Status: false, Error: 'Invalid Token' });
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        });
    } else {
        return res.status(401).json({ Status: false, Error: 'Not authenticated' });
    }
};

// Example route that requires authentication
app.get('/verify', verifyUser, (req, res) => {
    return res.json({ Status: true, role: req.role, id: req.id });
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
