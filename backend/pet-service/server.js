const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const petController = require('./controllers/petController');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Pet Service is running', 
    port: PORT,
    service: 'pet-service'
  });
});

// ========================================
// PHOTO UPLOAD ROUTE
// ========================================
app.post('/pets/:id/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    console.log('Photo upload request for pet:', id);

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;

    console.log('Uploading to Supabase Storage:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL:', publicUrl);

    // Update pet with new photo URL in dim_pet table
    const { error: updateError } = await supabase
      .from('dim_pet')  // ✅ FIXED: Using dim_pet instead of pets
      .update({ photo_url: publicUrl })
      .eq('pet_id', id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Pet updated with photo URL');

    res.json({ 
      success: true,
      photo_url: publicUrl,
      path: fileName
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// REGULAR PET ROUTES
// ========================================
app.get('/pets/all', petController.getAllPetsForAdmin);
app.get('/pets', petController.getAllPets);
app.get('/pets/:id', petController.getPetById);
app.post('/pets', petController.createPet);
app.put('/pets/:id', petController.updatePet);
app.delete('/pets/:id', petController.deletePet);
app.post('/pets/:id/track-scan', petController.trackQRScan);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Pet Service Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    service: 'pet-service'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    service: 'pet-service'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🐾 Pet Service running on http://localhost:${PORT}`);
  console.log(`Available routes:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /pets`);
  console.log(`  GET  /pets/all`);
  console.log(`  GET  /pets/:id`);
  console.log(`  POST /pets`);
  console.log(`  PUT  /pets/:id`);
  console.log(`  DELETE /pets/:id`);
  console.log(`  POST /pets/:id/upload-photo`);
  console.log(`  POST /pets/:id/track-scan`);
});