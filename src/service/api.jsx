import axios from 'axios';

const service = axios.create({
  baseURL: "http://127.0.0.1:8090/api",
  timeout: 1000000,
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

const plannerApi = {
  getAllThemes: () => service.get('/v1/planner/themes'),
  getResourcesByTheme: (themeId) => service.get(`/v1/planner/theme-resources/${themeId}`),
  planRoute: (data) => service.post('/v1/planner/plan', data),
  evaluateRoute: (data) => service.post('/v1/planner/evaluate', data),
};

const announcementApi = {
  getList: (params) => {
   
    const skip = Number.isNaN(Number(params.skip)) ? 0 : Number(params.skip);
    const limit = Number.isNaN(Number(params.limit)) ? 10 : Number(params.limit);

    return service.get('/announcements', {
      params: { skip, limit }
    });
  },
  update: (id) => service.put(`/announcements/${id}`),
  getDetail: (id) => service.get(`/announcements/${id}`),
  publish: (data) => service.post('/announcements', data),
  delete: (id) => service.delete(`/announcements/${id}`),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios({
      url: `${service.defaults.baseURL}/announcements/upload`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      timeout: 10000,
      withCredentials: true
    });
  }
};

export default { 
  authApi, 
  plannerApi,
  announcementApi
};