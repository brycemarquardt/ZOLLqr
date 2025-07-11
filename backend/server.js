const express = require('express');
const path = require('path');
require('dotenv').config(); // Load .env file
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();
app.use(express.json());

// Serve frontend
app.use(express.static('frontend'));

// Serve login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/files', authRoutes, fileRoutes); // Protect file routes with auth middleware

// Redirect root to index or login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
