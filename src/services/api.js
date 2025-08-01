import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8080'; // Update this with your backend URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Society services
export const societyService = {
  getAllSocieties: () => api.get('/societies/list'),
  getSocietyById: (id) => api.get(`/societies/${id}`),
  createSociety: (societyData) => api.post('/societies', societyData),
  updateSociety: (id, societyData) => api.put(`/societies/${id}`, societyData),
  deleteSociety: (id) => api.delete(`/societies/${id}`),
};

// Building services
export const buildingService = {
  getAllBuildings: (societyId) => api.get(`/societies/${societyId}/buildings`),
  getBuildingById: (id) => api.get(`/buildings/${id}`),
  createBuilding: (buildingData) => api.post('/buildings', buildingData),
  updateBuilding: (id, buildingData) => api.put(`/buildings/${id}`, buildingData),
  deleteBuilding: (id) => api.delete(`/buildings/${id}`),
};

// Flat services
export const flatService = {
  getAllFlats: (buildingId) => api.get(`/buildings/${buildingId}/flats`),
  getFlatById: (id) => api.get(`/flats/${id}`),
  createFlat: (flatData) => api.post('/flats', flatData),
  updateFlat: (id, flatData) => api.put(`/flats/${id}`, flatData),
  deleteFlat: (id) => api.delete(`/flats/${id}`),
  requestFlatAllocation: (requestData) => api.post('/flats/allocation-requests', requestData),
};

// Flat member services
export const flatMemberService = {
  getAllFlatMembers: (flatId) => api.get(`/flats/${flatId}/members`),
  getFlatMemberById: (id) => api.get(`/flat-members/${id}`),
  createFlatMember: (memberData) => api.post('/flat-members', memberData),
  updateFlatMember: (id, memberData) => api.put(`/flat-members/${id}`, memberData),
  deleteFlatMember: (id) => api.delete(`/flat-members/${id}`),
};

// Complaint services
export const complaintService = {
  getAllComplaints: () => api.get('/complaints'),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  createComplaint: (complaintData) => api.post('/complaints', complaintData),
  updateComplaint: (id, complaintData) => api.put(`/complaints/${id}`, complaintData),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
};

// Maintenance bill services
export const maintenanceBillService = {
  getAllBills: () => api.get('/maintenance-bills'),
  getBillById: (id) => api.get(`/maintenance-bills/${id}`),
  payBill: (id, paymentData) => api.post(`/maintenance-bills/${id}/pay`, paymentData),
};

// Notice services
export const noticeService = {
  getAllNotices: () => api.get('/notices'),
  getNoticeById: (id) => api.get(`/notices/${id}`),
  createNotice: (noticeData) => api.post('/notices', noticeData),
  updateNotice: (id, noticeData) => api.put(`/notices/${id}`, noticeData),
  deleteNotice: (id) => api.delete(`/notices/${id}`),
};

// Visitor services
export const visitorService = {
  getAllVisitors: () => api.get('/visitors'),
  getVisitorById: (id) => api.get(`/visitors/${id}`),
  createVisitor: (visitorData) => api.post('/visitors', visitorData),
  updateVisitor: (id, visitorData) => api.put(`/visitors/${id}`, visitorData),
  approveVisitor: (id) => api.put(`/visitors/${id}/approve`),
  rejectVisitor: (id) => api.put(`/visitors/${id}/reject`),
};

export default api;