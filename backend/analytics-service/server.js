const express = require('express');
const cors = require('cors');
const analyticsController = require('./controllers/analyticsController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Analytics Service is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ===============================================
// ANALYTICS ROUTES
// ===============================================

// Overall statistics
app.get('/analytics/stats', analyticsController.getOverallStatistics);

// Monthly adoption trends
app.get('/analytics/monthly-trends', analyticsController.getMonthlyTrends);

// Species adoption rates
app.get('/analytics/species-rates', analyticsController.getSpeciesRates);

// Average shelter stay (processing time)
app.get('/analytics/shelter-stay', analyticsController.getAverageShelterStay);

// Adoption by age group
app.get('/analytics/adoptions-by-age-group', analyticsController.getAdoptionByAgeGroup);

// Adoption by location
app.get('/analytics/adoptions-by-location', analyticsController.getAdoptionByLocation);

// Quarterly performance
app.get('/analytics/quarterly-performance', analyticsController.getQuarterlyPerformance);

// Previous owner analysis
app.get('/analytics/previous-owner-analysis', analyticsController.getPreviousOwnerAnalysis);

// ===============================================
// ERROR HANDLING
// ===============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    service: 'analytics-service'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Analytics Service Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    service: 'analytics-service'
  });
});

// ===============================================
// START SERVER
// ===============================================

app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on http://localhost:${PORT}`);
  console.log(`Available routes:`);
  console.log(`  GET /health`);
  console.log(`  GET /analytics/stats`);
  console.log(`  GET /analytics/monthly-trends`);
  console.log(`  GET /analytics/species-rates`);
  console.log(`  GET /analytics/shelter-stay`);
  console.log(`  GET /analytics/adoptions-by-age-group`);
  console.log(`  GET /analytics/adoptions-by-location`);
  console.log(`  GET /analytics/quarterly-performance`);
  console.log(`  GET /analytics/previous-owner-analysis`);
});