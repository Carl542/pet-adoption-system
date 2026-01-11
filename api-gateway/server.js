const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// Service URLs
const PET_SERVICE_URL = process.env.PET_SERVICE_URL || 'http://localhost:3001';
const ADOPTION_SERVICE_URL = process.env.ADOPTION_SERVICE_URL || 'http://localhost:3002';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway running',
    port: PORT,
    services: {
      PET: PET_SERVICE_URL,
      ADOPTION: ADOPTION_SERVICE_URL,
      AUTH: AUTH_SERVICE_URL,
      ANALYTICS: ANALYTICS_SERVICE_URL
    }
  });
});

// ========================================
// PHOTO UPLOAD ROUTE (MUST BE FIRST!)
// ========================================
app.post('/api/pets/:id/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    console.log('Gateway: Photo upload request for pet', req.params.id);
    
    const formData = new FormData();
    formData.append('photo', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `${PET_SERVICE_URL}/pets/${req.params.id}/upload-photo`,
      formData,
      { 
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('Gateway: Upload successful');
    res.json(response.data);
  } catch (error) {
    console.error('Gateway: Photo upload error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

// ========================================
// PET ROUTES
// ========================================
app.get('/api/pets', async (req, res) => {
  try {
    const response = await axios.get(`${PET_SERVICE_URL}/pets`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/pets/all', async (req, res) => {
  try {
    const response = await axios.get(`${PET_SERVICE_URL}/pets/all`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/pets/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PET_SERVICE_URL}/pets/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const response = await axios.post(`${PET_SERVICE_URL}/pets`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.put('/api/pets/:id', async (req, res) => {
  try {
    const response = await axios.put(`${PET_SERVICE_URL}/pets/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PET_SERVICE_URL}/pets/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ⭐ NEW: QR Scan Tracking Route
app.post('/api/pets/:id/track-scan', async (req, res) => {
  try {
    const response = await axios.post(`${PET_SERVICE_URL}/pets/${req.params.id}/track-scan`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ========================================
// ADOPTION ROUTES
// ========================================
app.post('/api/adoptions', async (req, res) => {
  try {
    const response = await axios.post(`${ADOPTION_SERVICE_URL}/adoptions`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/adoptions', async (req, res) => {
  try {
    const response = await axios.get(`${ADOPTION_SERVICE_URL}/adoptions`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/adoptions/user/:userId', async (req, res) => {
  try {
    const response = await axios.get(`${ADOPTION_SERVICE_URL}/adoptions/user/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.put('/api/adoptions/:id/status', async (req, res) => {
  try {
    const response = await axios.put(`${ADOPTION_SERVICE_URL}/adoptions/${req.params.id}/status`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ========================================
// AUTH ROUTES
// ========================================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/signup`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/admin-login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/logout`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ========================================
// ANALYTICS ROUTES
// ========================================
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/stats`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/analytics/monthly-trends', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/monthly-trends`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/analytics/species-rates', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/species-rates`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/analytics/shelter-stay', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/shelter-stay`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ⭐ NEW ANALYTICS ROUTES
app.get('/api/analytics/adoptions-by-age-group', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/adoptions-by-age-group`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/analytics/adoptions-by-location', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/adoptions-by-location`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/analytics/quarterly-performance', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/quarterly-performance`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get('/api/analytics/previous-owner-analysis', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/previous-owner-analysis`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ========================================
// ERROR HANDLING
// ========================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.use((error, req, res, next) => {
  console.error('Gateway Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Routing to:`);
  console.log(`   - Pet Service: ${PET_SERVICE_URL}`);
  console.log(`   - Adoption Service: ${ADOPTION_SERVICE_URL}`);
  console.log(`   - Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`   - Analytics Service: ${ANALYTICS_SERVICE_URL}`);
});