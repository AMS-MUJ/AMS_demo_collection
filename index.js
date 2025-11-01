import express from 'express';
import dotenv from 'dotenv';
import KeepAliveService from '../AMS_demo_collection/utils/keepServerAlive.js';
dotenv.config();
import mongoose from 'mongoose';
import cors from 'cors';
//import multer from 'multer';
import { uploadOnCloudinary } from './utils/cloudinary.js';
const app = express();

const allowedOrigins = ["https://amsdatacollection1.netlify.app"];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true, // optional if you send cookies
  })
);
const deployedUrl = process.env.DEPLOYED_URL; // e.g., 'https://your-app-name.onrender.com'
 
 if (deployedUrl) {
  const keepAlive = new KeepAliveService(deployedUrl, 14); // Ping every 14 minutes
  keepAlive.start();
  } else if (process.env.ENABLE_KEEP_ALIVE === 'true') {
        console.warn("KeepAliveService: ENABLE_KEEP_ALIVE is true, but no DEPLOYED_URL was provided.");
    }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import submissionsRoute from './routes/submissions.js';
app.use('/api/submissions', submissionsRoute);

// Default route (optional)
app.get('/', (req, res) => {
  res.send('Server is up and running 🚀');
 
});

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT ||5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(err));
export {app};
