const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Upload pet photo through backend API
export const uploadPetPhoto = async (file, petId) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Uploading via backend API...', { petId, fileName: file.name });

    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_URL}/pets/${petId}/upload-photo`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return {
      path: data.path || '',
      url: data.photo_url
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

// Update pet's photo URL through backend
export const updatePetPhotoUrl = async (petId, photoUrl) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_url: photoUrl })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Update failed');
    }

    return data;
  } catch (error) {
    console.error('Error updating pet photo URL:', error);
    throw error;
  }
};

// Complete photo upload and update
export const uploadAndUpdatePetPhoto = async (file, petId) => {
  try {
    // Upload photo through backend - it handles both upload and update
    await uploadPetPhoto(file, petId);
    
    // Fetch updated pet data
    const petResponse = await fetch(`${API_URL}/pets/${petId}`);
    const updatedPet = await petResponse.json();
    
    return updatedPet;
  } catch (error) {
    console.error('Error in uploadAndUpdatePetPhoto:', error);
    throw error;
  }
};

// Delete pet photo (not implemented in backend yet)
export const deletePetPhoto = async (filePath) => {
  console.warn('Delete photo not implemented');
  return { success: false };
};

// Get all photos for a pet (not implemented in backend yet)
export const getPetPhotos = async (petId) => {
  console.warn('Get photos not implemented');
  return [];
};