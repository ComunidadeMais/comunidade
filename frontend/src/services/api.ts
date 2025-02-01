import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

const publicRoutes = [
  '/events/*/public',
  '/login',
  '/register',
  '/forgot-password'
];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const currentPath = config.url?.replace(config.baseURL || '', '');
  
  const isPublicRoute = publicRoutes.some(route => {
    const pattern = new RegExp(route.replace('*', '[^/]+'));
    return pattern.test(currentPath || '');
  });
  
  console.log('API Request:', {
    method: config.method,
    url: currentPath,
    isPublicRoute,
    hasToken: !!token,
    headers: config.headers
  });

  if (token && config.headers && !isPublicRoute) {
    console.log('Token adicionado ao header');
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const currentPath = error.config?.url?.replace(error.config?.baseURL || '', '');
    
    const isPublicRoute = publicRoutes.some(route => {
      const pattern = new RegExp(route.replace('*', '[^/]+'));
      return pattern.test(currentPath || '');
    });

    console.log('Erro na requisição para:', currentPath, 'É rota pública?', isPublicRoute);

    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api; 