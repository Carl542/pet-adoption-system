const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Auth Service running', 
    port: PORT,
    service: 'auth-service'
  });
});

// Routes
app.post('/signup', authController.signUp);
app.post('/login', authController.signIn);
app.post('/admin-login', authController.adminLogin);
app.post('/logout', authController.signOut);
app.get('/session', authController.getCurrentSession);
app.get('/user', authController.getCurrentUser);

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on http://localhost:${PORT}`);
  console.log('Admin credentials: admin@shelter.com / admin123');
});