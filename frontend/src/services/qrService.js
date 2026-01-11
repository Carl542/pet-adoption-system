import QRCode from 'qrcode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Generate QR code URL for a pet
export const generateQRCode = async (petId, petName) => {
  try {
    const baseUrl = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
    const petUrl = `${baseUrl}/pet/${petId}`;

    // Generate QR code as data URL (base64)
    const qrCodeDataUrl = await QRCode.toDataURL(petUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      url: petUrl,
      qrCodeDataUrl,
      petId
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Track QR code scan through backend API
export const trackQRScan = async (petId) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}/track-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAgent: navigator.userAgent
      })
    });

    if (!response.ok) {
      throw new Error('Failed to track scan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking QR scan:', error);
    throw error;
  }
};

// Generate QR code for download/display
export const generateAndSaveQRCode = async (petId, petName) => {
  try {
    const qrData = await generateQRCode(petId, petName);
    return qrData;
  } catch (error) {
    console.error('Error in generateAndSaveQRCode:', error);
    throw error;
  }
};

// Get QR scan statistics (from fact_adoptions table)
export const getQRScanStats = async (petId) => {
  try {
    // Get pet to find if it's adopted
    const petResponse = await fetch(`${API_URL}/pets/${petId}`);
    if (!petResponse.ok) {
      throw new Error('Pet not found');
    }
    
    const pet = await petResponse.json();
    
    return {
      totalScans: pet.status === 'Adopted' ? (pet.qr_scan_count || 0) : 0,
      lastScan: null, // We don't track individual scan timestamps anymore
      status: pet.status
    };
  } catch (error) {
    console.error('Error fetching QR scan stats:', error);
    throw error;
  }
};