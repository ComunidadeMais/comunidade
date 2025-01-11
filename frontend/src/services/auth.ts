import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  User 
} from '../types/user';

const API_URL = 'http://localhost:8080/api/v1';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  console.log('Token atual:', token);

  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
    
    // Mantendo o Content-Type apenas se não for upload de arquivo
    if (!config.url?.includes('avatar')) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  return config;
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Se não é erro de autenticação ou já é uma tentativa de refresh, rejeita direto
    if (error.response?.status !== 401 || originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Se não tem refresh token, faz logout
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      AuthService.logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        // Tenta renovar o token
        const response = await api.post<LoginResponse>('/auth/refresh', {
          refresh_token: refreshToken
        });

        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Atualiza o token no request original e nos requests da fila
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        processQueue();
        
        // Refaz a requisição original com o novo token
        return api(originalRequest!);
      } catch (refreshError) {
        processQueue(refreshError);
        AuthService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Se já está renovando, adiciona a requisição à fila
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => {
      return api(originalRequest!);
    }).catch((err) => {
      return Promise.reject(err);
    });
  }
);

export const AuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', data);
      const { token, refresh_token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<void> {
    try {
      await api.post('/auth/register', data);
    } catch (error) {
      throw error;
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      await api.post('/auth/forgot-password', data);
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await api.post('/auth/reset-password', data);
    } catch (error) {
      throw error;
    }
  },

  async getProfile(): Promise<User> {
    try {
      console.log('Obtendo perfil do usuário...');
      console.log('Token atual:', this.getToken());
      const response = await api.get<{ user: User }>('/user/profile');
      console.log('Resposta completa do perfil:', response);
      return response.data.user;
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>('/user/profile', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePassword(data: { current_password: string; new_password: string }): Promise<void> {
    try {
      await api.put('/user/password', data);
    } catch (error) {
      throw error;
    }
  },

  async updateAvatar(file: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.put<User>('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
}; 