import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import { getToken, saveToken } from './MmkvStorageHelper';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  async config => {
    try {
      const token = getToken('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
