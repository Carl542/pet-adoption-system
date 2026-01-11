const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Get available pets (for public/homepage)
export const getAllPets = async () => {
  try {
    const response = await fetch(`${API_URL}/pets`);
    if (!response.ok) throw new Error('Failed to fetch pets');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Get ALL pets including adopted (for admin dashboard)
export const getAllPetsForAdmin = async () => {
  try {
    const response = await fetch(`${API_URL}/pets/all`);
    if (!response.ok) throw new Error('Failed to fetch all pets');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getPetById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pets/${id}`);
    if (!response.ok) throw new Error('Pet not found');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createPet = async (petData) => {
  try {
    const response = await fetch(`${API_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData)
    });
    if (!response.ok) throw new Error('Failed to create pet');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updatePet = async (id, petData) => {
  try {
    const response = await fetch(`${API_URL}/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData)
    });
    if (!response.ok) throw new Error('Failed to update pet');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deletePet = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pets/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete pet');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const trackQRScan = async (petId, scanData) => {
  try {
    const response = await fetch(`${API_URL}/pets/${petId}/track-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanData)
    });
    if (!response.ok) throw new Error('Failed to track scan');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};