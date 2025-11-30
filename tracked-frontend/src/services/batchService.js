import axios from 'axios';
import { API_URL as API_BASE_URL } from '../config/api';

// Get authentication token (support multiple roles)
const getAuthToken = () => {
  return sessionStorage.getItem('trainerToken') || 
         sessionStorage.getItem('adminToken') || 
         sessionStorage.getItem('staffToken');
};

// Get all batches assigned to the authenticated trainer
export const getTrainerBatches = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/trainer/batches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trainer batches:', error);
    throw error.response?.data?.message || 'Failed to fetch batches';
  }
};

// Get all batches (for admin/staff)
export const getAllBatches = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/batches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error.response?.data?.message || 'Failed to fetch batches';
  }
};

// Get single batch details
export const getBatch = async (batchId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/batches/${batchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching batch:', error);
    throw error.response?.data?.message || 'Failed to fetch batch';
  }
};

// Get students enrolled in a batch
export const getBatchStudents = async (batchId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/batches/${batchId}/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching batch students:', error);
    throw error.response?.data?.message || 'Failed to fetch students';
  }
};

export default {
  getTrainerBatches,
  getAllBatches,
  getBatch,
  getBatchStudents
};
