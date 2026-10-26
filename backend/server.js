require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/master');
const complaintRoutes = require('./routes/complaint');
const notificationRoutes = require('./routes/notification');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback for requests sent without /api prefix
app.use('/auth', authRoutes);
app.use('/master', masterRoutes);
app.use('/complaint', complaintRoutes);
app.use('/notifications', notificationRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
