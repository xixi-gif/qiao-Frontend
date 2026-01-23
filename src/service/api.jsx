import axios from 'axios';

const service = axios.create({
  baseURL: "http://127.0.0.1:8090/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
  transformRequest: [function (data) {
    return JSON.stringify(data);
  }],
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authApi = {
  register: (data) => service.post('/auth/register', data),
  login: (data) => service.post('/auth/login', data),
  sendVerifyCode: (data) => service.post('/auth/send-verify-code', data),
  resetPassword: (data) => service.post('/auth/reset-password', data),
  getProfile: () => service.get('/auth/profile'),
  updateProfile: (data) => service.put('/auth/profile', data)
};

export default { authApi };