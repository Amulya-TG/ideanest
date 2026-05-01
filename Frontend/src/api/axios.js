import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/users/refresh/', { refresh });
        const newAccess = res.data.access;
        localStorage.setItem('token', newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return API(original);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default API;