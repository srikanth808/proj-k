import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '') + '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle other errors
        if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
          toast.error('Resource not found.');
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods - simplified for registration only
  async register(userData: any) {
    // Backend UserViewSet exposes user creation at /api/auth/users/ (POST)
    const response = await this.api.post('/auth/users/', userData);
    return response.data;
  }

  // Generic CRUD methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  // Specific API methods
  async getPlayers(params?: any) {
    return this.api.get('/players/', { params });
  }

  async createPlayer(playerData: any) {
    return this.api.post('/players/', playerData);
  }

  async getFixtures(params?: any) {
    return this.api.get('/fixtures/', { params });
  }

  async generateFixtures() {
    return this.api.post('/fixtures/generate/');
  }

  async getMatches(params?: any) {
    return this.api.get('/matches/', { params });
  }

  async getGames(matchId: string) {
    return this.api.get('/scoring/games/', { params: { match: matchId } });
  }

  async addPoint(gameId: string, playerId: string) {
    return this.api.post(`/scoring/games/${gameId}/add_point/`, { player: playerId });
  }

  async undoPoint(gameId: string) {
    return this.api.post(`/scoring/games/${gameId}/undo_point/`);
  }

  async getStats() {
    return this.api.get('/stats/');
  }

  async exportData(type: 'pdf' | 'csv' | 'excel') {
    return this.api.get(`/export/${type}/`, { responseType: 'blob' });
  }
}

const apiService = new ApiService();
export default apiService;
