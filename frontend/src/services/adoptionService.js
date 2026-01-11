const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Get all adoption applications with pet details
export async function getAllApplications() {
  try {
    const response = await fetch(`${API_URL}/adoptions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    const data = await response.json();
    console.log('Applications loaded:', data);
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting applications:', error);
    return { data: null, error: error.message };
  }
}

// Update application status
export async function updateApplicationStatus(adoptionId, newStatus, notes = '') {
  try {
    const response = await fetch(`${API_URL}/adoptions/${adoptionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: newStatus,
        notes: notes 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update application status');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { data: null, error: error.message };
  }
}

// Submit a new adoption application
export async function submitAdoptionApplication(applicationData) {
  try {
    const response = await fetch(`${API_URL}/adoptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });

    if (!response.ok) {
      throw new Error('Failed to submit application');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { data: null, error: error.message };
  }
}

// Get applications for a specific pet
export async function getApplicationsByPetId(petId) {
  try {
    const response = await fetch(`${API_URL}/adoptions/pet/${petId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch applications by pet');
    }

    const data = await response.json();
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting applications by pet:', error);
    return { data: null, error: error.message };
  }
}

// Get a single application by ID
export async function getApplicationById(adoptionId) {
  try {
    const response = await fetch(`${API_URL}/adoptions/${adoptionId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch application');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error getting application:', error);
    return { data: null, error: error.message };
  }
}

// Delete an application
export async function deleteApplication(adoptionId) {
  try {
    const response = await fetch(`${API_URL}/adoptions/${adoptionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete application');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting application:', error);
    return { data: null, error: error.message };
  }
}

// Get applications by user email (for MyApplicationsPage)
export async function getUserApplications(userEmail) {
  try {
    const response = await fetch(`${API_URL}/adoptions/user/${encodeURIComponent(userEmail)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch user applications');
    }

    const data = await response.json();
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting user applications:', error);
    return { data: null, error: error.message };
  }
}