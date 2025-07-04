// index.js
import express from 'express'; // use require('express') if you're not using ES Modules
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
