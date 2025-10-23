const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
const submissionsRoute = require('./routes/submissions');
app.use('/api/submissions', submissionsRoute);

// Default route (optional)
app.get('/', (req, res) => {
  res.send('Server is up and running 🚀');
});

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(err));
