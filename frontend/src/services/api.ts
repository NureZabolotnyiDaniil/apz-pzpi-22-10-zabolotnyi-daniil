import axios, { AxiosInstance } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;
  public baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await this.api.post('/admin/login', credentials);
    return response.data;
  }

  register = async (userData: RegisterRequest): Promise<{ message: string }> => {
    const response = await this.api.post('/admin/register', userData);
    return response.data;
  }

  getCurrentUser = async () => {
    const response = await this.api.get('/admin/me');
    return response.data;
  }

  // Admin endpoints
  getAdmins = async () => {
    const response = await this.api.get('/admin/list');
    return response.data;
  }

  updateAdmin = async (adminData: any) => {
    const response = await this.api.put('/admin/edit', adminData);
    return response.data;
  }

  updateAdminStatus = async (email: string, statusData: any) => {
    const response = await this.api.put(`/admin/update_status/${email}`, statusData);
    return response.data;
  }

  deleteAdmin = async (adminId: number) => {
    const response = await this.api.delete(`/admin/delete/${adminId}`);
    return response.data;
  }

  // Lantern endpoints
  getLanterns = async () => {
    const response = await this.api.get('/lantern/list');
    return response.data;
  }

  getLantern = async (id: number) => {
    const response = await this.api.get(`/lantern/lantern/${id}`);
    return response.data;
  }

  createLantern = async (lanternData: any) => {
    const response = await this.api.post('/lantern/add', null, {
      params: lanternData
    });
    return response.data;
  }

  updateLantern = async (id: number, lanternData: any) => {
    const response = await this.api.put(`/lantern/update/${id}`, null, {
      params: lanternData
    });
    return response.data;
  }

  deleteLantern = async (id: number) => {
    const response = await this.api.delete(`/lantern/delete/${id}`);
    return response.data;
  }

  // Park endpoints
  getParks = async () => {
    const response = await this.api.get('/park/list');
    return response.data;
  }

  getPark = async (id: number) => {
    const response = await this.api.get(`/park/info/${id}`);
    return response.data;
  }

  createPark = async (parkData: any) => {
    const response = await this.api.post('/park/add', null, {
      params: parkData
    });
    return response.data;
  }

  updatePark = async (id: number, parkData: any) => {
    const response = await this.api.put(`/park/update/${id}`, null, {
      params: parkData
    });
    return response.data;
  }

  deletePark = async (id: number) => {
    const response = await this.api.delete(`/park/delete/${id}`);
    return response.data;
  }

  // Statistics endpoints
  getStatistics = async () => {
    // Since there's no general statistics endpoint, we'll combine data from available endpoints
    try {
      const [lanterns, parks, breakdowns] = await Promise.all([
        this.getLanterns(),
        this.getParks(),
        this.getBreakdowns()
      ]);
      
      return {
        totalLanterns: lanterns?.length || 0,
        activeLanterns: lanterns?.filter((l: any) => l.status === 'working')?.length || 0,
        brokenLanterns: lanterns?.filter((l: any) => l.status === 'broken')?.length || 0,
        totalParks: parks?.length || 0,
        totalBreakdowns: breakdowns?.length || 0,
        activeBreakdowns: breakdowns?.filter((b: any) => b.status !== 'fixed')?.length || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  getParkStatistics = async (parkId: number) => {
    const response = await this.api.post('/statistics/park_statistics', null, {
      params: { park_id: parkId }
    });
    return response.data;
  }

  getEfficiencyStatistics = async (parkId?: number, energyCost: number = 4.32) => {
    const response = await this.api.post('/statistics/efficiency_statistics', null, {
      params: { park_id: parkId, energy_cost: energyCost }
    });
    return response.data;
  }

  // Company endpoints
  getCompanies = async () => {
    const response = await this.api.get('/company/list');
    return response.data;
  }

  createCompany = async (companyData: any) => {
    const response = await this.api.post('/company/add', null, {
      params: companyData
    });
    return response.data;
  }

  updateCompany = async (id: number, companyData: any) => {
    const response = await this.api.put(`/company/update/${id}`, null, {
      params: companyData
    });
    return response.data;
  }

  deleteCompany = async (id: number) => {
    const response = await this.api.delete(`/company/delete/${id}`);
    return response.data;
  }

  // Repairman endpoints
  getRepairmen = async () => {
    const response = await this.api.get('/repairman/list');
    return response.data;
  }

  createRepairman = async (repairmanData: any) => {
    const response = await this.api.post('/repairman/add', null, {
      params: repairmanData
    });
    return response.data;
  }

  updateRepairman = async (id: number, repairmanData: any) => {
    const response = await this.api.put(`/repairman/update/${id}`, null, {
      params: repairmanData
    });
    return response.data;
  }

  deleteRepairman = async (id: number) => {
    const response = await this.api.delete(`/repairman/delete/${id}`);
    return response.data;
  }

  // Breakdown endpoints
  getBreakdowns = async () => {
    const response = await this.api.get('/breakdown/list');
    return response.data;
  }

  createBreakdown = async (breakdownData: any) => {
    const response = await this.api.post('/breakdown/add', null, {
      params: breakdownData
    });
    return response.data;
  }

  updateBreakdown = async (id: number, breakdownData: any) => {
    const response = await this.api.put(`/breakdown/update/${id}`, null, {
      params: breakdownData
    });
    return response.data;
  }

  deleteBreakdown = async (id: number) => {
    const response = await this.api.delete(`/breakdown/delete/${id}`);
    return response.data;
  }

  // Renovation endpoints
  getRenovations = async () => {
    const response = await this.api.get('/renovation/list');
    return response.data;
  }

  createRenovation = async (renovationData: any) => {
    const response = await this.api.post('/renovation/add', null, {
      params: renovationData
    });
    return response.data;
  }

  updateRenovation = async (id: number, renovationData: any) => {
    const response = await this.api.put(`/renovation/update/${id}`, null, {
      params: renovationData
    });
    return response.data;
  }

  deleteRenovation = async (id: number) => {
    const response = await this.api.delete(`/renovation/delete/${id}`);
    return response.data;
  }

  // Mobile API endpoints
  getMobileLanternsStatus = async () => {
    const response = await this.api.get('/mobile/lanterns/status');
    return response.data;
  }

  getMobileLanternStatus = async (id: number) => {
    const response = await this.api.get(`/mobile/lanterns/${id}/status`);
    return response.data;
  }

  controlLantern = async (lanternId: number, action: string) => {
    const response = await this.api.post('/mobile/lanterns/control', null, {
      params: { lantern_id: lanternId, action }
    });
    return response.data;
  }

  getMobileBreakdownNotifications = async () => {
    const response = await this.api.get('/mobile/notifications/breakdowns');
    return response.data;
  }

  getMobileBreakdownHistory = async () => {
    const response = await this.api.get('/mobile/history/breakdowns');
    return response.data;
  }

  registerMobileNotifications = async (token: string) => {
    const response = await this.api.post('/mobile/notifications/register', null, {
      params: { token }
    });
    return response.data;
  }

  getMobileHealth = async () => {
    const response = await this.api.get('/mobile/health');
    return response.data;
  }

  // IoT endpoints
  getIoTLanternSettings = async (lanternId: number) => {
    const response = await this.api.get(`/iot/${lanternId}/settings`);
    return response.data;
  }

  postIoTMotion = async (lanternId: number) => {
    const response = await this.api.post(`/iot/${lanternId}/motion`);
    return response.data;
  }

  postIoTFault = async (lanternId: number, faultCode: string) => {
    const response = await this.api.post(`/iot/${lanternId}/fault`, null, {
      params: { fault_code: faultCode }
    });
    return response.data;
  }

  postIoTReboot = async (lanternId: number) => {
    const response = await this.api.post(`/iot/${lanternId}/reboot`);
    return response.data;
  }

  getIoTLanternStatus = async (lanternId: number) => {
    const response = await this.api.get(`/iot/${lanternId}/status`);
    return response.data;
  }

  // Fix incorrect endpoint URLs
  getRepairman = async (id: number) => {
    const response = await this.api.get(`/repairman/info/${id}`);
    return response.data;
  }

  getRenovation = async (id: number) => {
    const response = await this.api.get(`/renovation/info/${id}`);
    return response.data;
  }

  getBreakdown = async (id: number) => {
    const response = await this.api.get(`/breakdown/info/${id}`);
    return response.data;
  }

  getCompany = async (id: number) => {
    const response = await this.api.get(`/company/info/${id}`);
    return response.data;
  }

  // Updates endpoints
  getUpdates = async (skip: number = 0, limit: number = 10) => {
    const response = await this.api.get('/updates/', {
      params: { skip, limit }
    });
    return response.data;
  }

  // Activities endpoints
  getActivities = async (skip: number = 0, limit: number = 20) => {
    const response = await this.api.get('/activities/', {
      params: { skip, limit }
    });
    return response.data;
  }

  getRecentActivities = async (limit: number = 10) => {
    const response = await this.api.get('/activities/recent', {
      params: { limit }
    });
    return response.data;
  }

  getUpdate = async (id: number) => {
    const response = await this.api.get(`/updates/${id}`);
    return response.data;
  }

  createUpdate = async (updateData: any) => {
    const response = await this.api.post('/updates/', updateData);
    return response.data;
  }

  updateUpdate = async (id: number, updateData: any) => {
    const response = await this.api.put(`/updates/${id}`, updateData);
    return response.data;
  }

  deleteUpdate = async (id: number) => {
    const response = await this.api.delete(`/updates/${id}`);
    return response.data;
  }

  // Export and backup functions
  exportData = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await this.api.post('/admin/export', null, {
        params: { export_format: format }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  exportExcel = async () => {
    try {
      const response = await this.api.post('/admin/export/excel', null, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  }

  createBackup = async () => {
    try {
      const response = await this.api.post('/admin/backup');
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  importData = async (formData: FormData) => {
    try {
      const response = await this.api.post('/admin/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Тестові методи без авторизації
  testCors = async () => {
    const response = await this.api.get('/test');
    return response.data;
  }

  getRecentActivitiesTest = async (limit: number = 10) => {
    const response = await this.api.get('/activities/recent-test', {
      params: { limit }
    });
    return response.data;
  }


}

export const apiService = new ApiService();
export default apiService; 