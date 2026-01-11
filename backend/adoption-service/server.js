const express = require('express');
const cors = require('cors');
const adoptionController = require('./controllers/adoptionController');

console.log('=== DEBUGGING ===');
console.log('Controller loaded:', adoptionController);
console.log('submitApplication exists?', typeof adoptionController.submitApplication);
console.log('getAllApplications exists?', typeof adoptionController.getAllApplications);
console.log('getUserApplications exists?', typeof adoptionController.getUserApplications);
console.log('updateApplicationStatus exists?', typeof adoptionController.updateApplicationStatus);
console.log('=== END DEBUG ===');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Adoption Service is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ===============================================
// ADOPTION ROUTES
// ===============================================

// Submit adoption application
app.post('/adoptions', adoptionController.submitApplication);

// Get all adoption applications (admin)
app.get('/adoptions', adoptionController.getAllApplications);

// Get user's adoption applications
app.get('/adoptions/user/:userId', adoptionController.getUserApplications);

// Update application status (approve/reject)
app.put('/adoptions/:id/status', adoptionController.updateApplicationStatus);

// ===============================================
// ERROR HANDLING
// ===============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    service: 'adoption-service'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Adoption Service Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    service: 'adoption-service'
  });
});

// ===============================================
// START SERVER
// ===============================================

app.listen(PORT, () => {
  console.log(`💙 Adoption Service running on http://localhost:${PORT}`);
  console.log(`Available routes:`);
  console.log(`  GET  /health`);
  console.log(`  POST /adoptions`);
  console.log(`  GET  /adoptions`);
  console.log(`  GET  /adoptions/user/:userId`);
  console.log(`  PUT  /adoptions/:id/status`);
});