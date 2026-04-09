import axios from 'axios';

const service = axios.create({
  baseURL:"http://127.0.0.1:8090/api",
  timeout:1000000,
  withCredentials:true
});

service.interceptors.request.use(config=>{
  const token = localStorage.getItem('accessToken');
  if(token)config.headers.Authorization = `Bearer ${token}`;
  return config;
},error=>Promise.reject(error));

service.interceptors.response.use(res=>res,error=>{
  return Promise.reject(error);
});

const authApi = {
  getUserFavorites:()=>service.get('/interact/favorite/user/list'),
  getUserLikes:()=>service.get('/interact/like/user/list'),
  getUserComments:()=>service.get('/interact/comment/user/list'),
  getMyMessages:()=>service.get('/interact/message/my'),
  readMessage:(id)=>service.post(`/interact/message/read/${id}`),
  readAllMessages:()=>service.post('/interact/message/read-all'),
  register:(data)=>service.post('/auth/register',data),
  login:(data)=>service.post('/auth/login',data),
  sendVerifyCode:(data)=>service.post('/auth/send-verify-code',data),
  resetPassword:(data)=>service.post('/auth/reset-password',data),
  getProfile:()=>service.get('/auth/profile'),
  updateProfile:(data)=>service.put('/auth/profile',data),
  uploadAvatar:(formData)=>service.post('/auth/avatar',formData,{headers:{'Content-Type':'multipart/form-data'}})
};

const plannerApi = {
  getAllThemes:()=>service.get('/v1/planner/themes'),
  getResourcesByTheme:(themeId)=>service.get(`/v1/planner/theme-resources/${themeId}`),
  planRoute:(data)=>service.post('/v1/planner/plan',data),
  evaluateRoute:(data)=>service.post('/v1/planner/evaluate',data)
};

const announcementApi = {
  getList:(params)=>{
    const skip = Number.isNaN(Number(params.skip))?0:Number(params.skip);
    const limit = Number.isNaN(Number(params.limit))?10:Number(params.limit);
    return service.get('/announcements',{params:{skip,limit}});
  },
  update:(id)=>service.put(`/announcements/${id}`),
  getDetail:(id)=>service.get(`/announcements/${id}`),
  publish:(data)=>service.post('/announcements',data),
  delete:(id)=>service.delete(`/announcements/${id}`),
  uploadFile:(file)=>{
    const formData = new FormData();
    formData.append('file',file);
    return service.post('/announcements/upload',formData,{headers:{'Content-Type':'multipart/form-data'}});
  }
};

const projectApi = {
  createProject:(formData)=>service.post('/merchant/projects',formData,{headers:{'Content-Type':'multipart/form-data'}}),
  getMyProjects:()=>service.get('/merchant/projects'),
  getProjectDetail:(id)=>service.get(`/merchant/projects/${id}`),
  deleteProject:(id)=>service.delete(`/merchant/projects/${id}`),
  updateProject:(id,formData)=>service.put(`/merchant/projects/${id}`,formData,{headers:{'Content-Type':'multipart/form-data'}}),
  adminGetProjects:(params)=>service.get('/admin/projects/list',{params}),
  adminGetProjectDetail:(id)=>service.get(`/admin/projects/${id}`),
  adminDeleteProject:(id)=>service.delete(`/admin/projects/${id}`),
  adminAudit:(id,status)=>service.put(`/admin/projects/audit/${id}`,{},{params:{status}}),
  adminBatchAudit:(ids,status)=>service.put('/admin/projects/batch-audit',{ids,status}),
  getActiveProjects:(params)=>service.get('/tourism/projects',{params}),
  getTourProjectDetail:(id)=>service.get(`/tourism/projects/${id}`),
  getMerchantInfo:(merchantId)=>service.get(`/tourism/merchant/${merchantId}`),
  addProjectView:(id)=>service.post(`/tourism/projects/${id}/view`),
  getMyCheckins:()=>service.get('/checkin/my'),
  createCheckin: (formData) => service.post('/checkin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCheckinDetail:(id)=>service.get(`/checkin/${id}`),
  updateCheckin:(id,data)=>service.put(`/checkin/${id}`,data),
  deleteCheckin:(id)=>service.delete(`/checkin/${id}`),
  getCheckinWall:(params)=>service.get('/checkin/wall',{params}),
  adminGetAllCheckins:(params)=>service.get('/checkin/admin/all',{params}),
  adminUpdateCheckinStatus:(id,status)=>service.put(`/checkin/admin/${id}/status`,{},{params:{status}}),
  uploadCheckinImage:(formData)=>service.post('/checkin/upload/image',formData,{headers:{'Content-Type':'multipart/form-data'}}),
  adminBatchCheckinAudit: (data) => service.put('/checkin/admin/batch-audit', data),

};

const userAdminApi = {
  getUserList:()=>service.get('/auth/admin/users'),
  updateUser:(id,data)=>service.put(`/auth/admin/users/${id}`,data),
  deleteUser:(id)=>service.delete(`/auth/admin/users/${id}`),
  toggleStatus:(id)=>service.put(`/auth/admin/users/${id}/toggle-status`)
};

const carouselApi = {
  getList:(params)=>service.get('/carousels',{params}),
  getById:(id)=>service.get(`/carousels/${id}`),
  create:(formData)=>service.post('/admin/carousels',formData,{headers:{'Content-Type':'multipart/form-data'}}),
  update:(id,formData)=>service.put(`/admin/carousels/${id}`,formData,{headers:{'Content-Type':'multipart/form-data'}}),
  updateSort:(id,sort_num)=>service.put(`/admin/carousels/sort/${id}`,null,{params:{sort_num}}),
  delete:(id)=>service.delete(`/admin/carousels/${id}`)
};

const tagApi = {
  getList:(params)=>service.get('/tags',{params}),
  getById:(id)=>service.get(`/tags/${id}`),
  create:(data)=>service.post('/tags/create',data),
  update:(id,data)=>service.put('/tags/update/'+id,data),
  delete:(id)=>service.delete('/tags/delete/'+id)
};

const categoryApi = {
  getList:(params)=>service.get('/categories',{params}),
  getById:(id)=>service.get(`/categories/${id}`),
  create:(data)=>service.post('/categories/create',data),
  update:(id,data)=>service.put('/categories/update/'+id,data),
  delete:(id)=>service.delete('/categories/delete/'+id)
};

const interactionApi = {
  createFavorite:(data)=>service.post('/interact/favorite',data),
  getFavoriteCount:(targetType,targetId)=>service.get('/interact/favorite/count',{params:{target_type:targetType,target_id:targetId}}),
  getUserFavoriteStatus:(targetType,targetId)=>service.get('/interact/favorite/status',{params:{target_type:targetType,target_id:targetId}}),
  createLike:(data)=>service.post('/interact/like',data),
  getLikeCount:(targetType,targetId)=>service.get('/interact/like/count',{params:{target_type:targetType,target_id:targetId}}),
  getUserLikeStatus:(targetType,targetId)=>service.get('/interact/like/status',{params:{target_type:targetType,target_id:targetId}}),
  createComment:(data)=>service.post('/interact/comment',data),
  getComments:(targetType,targetId)=>service.get(`/interact/comment/${targetType}/${targetId}`),
  deleteComment:(id)=>service.delete(`/interact/comment/${id}`),
  getAllComments:()=>service.get('/interact/admin/comment/all'),
  auditComment:(id,status)=>service.put(`/interact/admin/comment/audit/${id}`,{},{params:{status}}),
  adminDeleteComment:(id)=>service.delete(`/interact/admin/comment/${id}`)
};

const markdownApi = {
  getList:(params)=>service.get('/markdown/list',{params}),
  getAdminList:(params)=>service.get('/markdown/admin/list',{params}),
  getDetail:(id)=>service.get(`/markdown/${id}`),
  create:(data)=>service.post('/markdown/create',data),
  update:(id,data)=>service.put(`/markdown/${id}`,data),
  delete:(id)=>service.delete(`/markdown/${id}`),
  uploadImage:(formData)=>service.post('/markdown/image',formData,{headers:{'Content-Type':'multipart/form-data'}}),
  batchUpload:(formData)=>service.post('/markdown/batch-upload',formData,{headers:{'Content-Type':'multipart/form-data'}}),
  toggleFavorite: (docId, user_id) => service.post(`/markdown/favorite/${docId}`, {}, { params: { user_id } }),
  getMyFavorites: (user_id) => service.get("/markdown/my/favorites", { params: { user_id } }),
  getMyFavoriteIds: (user_id) => service.get("/markdown/my/favorite-ids", { params: { user_id } }),
  getKnowledgeGraph: () => service.get("/graph") ,
};

const chatApi = {
  createConversation:(uid,mid)=>{
    const fd=new FormData();
    fd.append('user_id',uid);
    fd.append('to_user_id',mid);
    return service.post('/chat/conversation',fd);
  },
  getConversations:(uid)=>service.get(`/chat/conversations/${uid}`),
  getConversation:(id)=>service.get(`/chat/conversation/${id}`),
  getMessages:(cid)=>service.get(`/chat/conversation/${cid}/messages`),
  sendMessage:(d)=>{
    const fd=new FormData();
    Object.keys(d).forEach(k=>d[k]!=null&&fd.append(k,d[k]));
    return service.post('/chat/message',fd);
  },
  markRead:(cid, uid)=>service.put(`/chat/conversation/${cid}/read?user_id=${uid}`),
  togglePin:(cid)=>service.put(`/chat/conversation/${cid}/pin`),
  upload:(fd)=>service.post('/chat/upload',fd,{headers:{'Content-Type':'multipart/form-data'}})
};

const merchantApi = {
  getAnalysis: (params) => service.get('/merchant/analysis/dashboard', { params }),
  getTrend: (params) => service.get('/merchant/analysis/trend', { params })
};

const qiaoxiangAiApi = {
  ask: (query) => service.post('/chat/qiaoxiang_ai', null, { params: { query } })
};

const adminApi = {
  getDashboard: (params) => service.get('/admin/statistics/dashboard', { params }),
  getTrend: (params) => service.get('/admin/statistics/trend', { params }),
  getUserActivity: () => service.get('/admin/statistics/user-activity'),
  getMerchantActivity: () => service.get('/admin/statistics/merchant-activity'),
  getTopProjects: () => service.get('/admin/statistics/top-projects'),
  getTopMerchants: () => service.get('/admin/statistics/top-merchants'),
  getTopUsers: () => service.get('/admin/statistics/top-users'),
  getMerchantStatus: () => service.get('/admin/statistics/merchant-status')
};

const riverApi = {
  getRiverImages: () => service.get("/river/images"),
  getRiverMessages: () => service.get("/river/messages"),
  addRiverMessage: (data) => service.post("/river/messages", data)
};

const studyApi = {
  getImages:()=>service.get('/study/images')
};

const messageApi = {
  getList: () => service.get('/river/messages'),
  create: (data) => service.post('/river/messages', data),
  delete: (id) => service.delete(`/river/messages/${id}`),
  batchDelete: (ids) => service.post('/river/messages/batch_delete', { ids }),
  getImages: () => service.get('/river/images')
};

export default {
  authApi,
  plannerApi,
  announcementApi,
  projectApi,
  userAdminApi,
  carouselApi,
  tagApi,
  categoryApi,
  interactionApi,
  markdownApi,
  chatApi,
  qiaoxiangAiApi,
  merchantApi,
  adminApi,
  riverApi,
  studyApi,
  messageApi
};