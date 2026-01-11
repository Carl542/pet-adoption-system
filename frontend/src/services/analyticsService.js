const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const getOverallStatistics = async () => {
  try {
    const response = await fetch(`${API_URL}/analytics/stats`);
    const result = await response.json();
    
    // Backend might return stats directly or wrapped in {data: ...}
    const stats = result.data || result;
    
    return { 
      data: stats, 
      error: response.ok ? null : (result.error || 'Failed to fetch stats')
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { data: null, error: error.message };
  }
};

export const getMonthlyAdoptionTrends = async () => {
  try {
    const response = await fetch(`${API_URL}/analytics/monthly-trends`);
    const result = await response.json();
    
    // Extract data array from response
    const actualData = result.data || result;
    
    return { 
      data: Array.isArray(actualData) ? actualData : [], 
      error: response.ok ? null : (result.error || 'Failed to fetch trends')
    };
  } catch (error) {
    console.error('Error fetching trends:', error);
    return { data: [], error: error.message };
  }
};

export const getSpeciesAdoptionRates = async () => {
  try {
    const response = await fetch(`${API_URL}/analytics/species-rates`);
    const result = await response.json();
    
    // Extract data array from response
    const actualData = result.data || result;
    
    return { 
      data: Array.isArray(actualData) ? actualData : [], 
      error: response.ok ? null : (result.error || 'Failed to fetch species rates')
    };
  } catch (error) {
    console.error('Error fetching species rates:', error);
    return { data: [], error: error.message };
  }
};

export const getAverageShelterStay = async () => {
  try {
    const response = await fetch(`${API_URL}/analytics/shelter-stay`);
    const result = await response.json();
    
    // This endpoint returns {data: [...], overall: number, error: null}
    // Extract both data and overall
    const shelterData = result.data || [];
    const overall = result.overall || 0;
    
    return { 
      data: Array.isArray(shelterData) ? shelterData : [], 
      overall: overall,
      error: response.ok ? null : (result.error || 'Failed to fetch shelter stay')
    };
  } catch (error) {
    console.error('Error fetching shelter stay:', error);
    return { data: [], overall: 0, error: error.message };
  }
};