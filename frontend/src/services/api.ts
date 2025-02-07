import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

const publicRoutes = [
  '/events/*/public',
  '/login',
  '/register',
  '/forgot-password',
  '/communities/*/public',
  '/communities/*/members/login',
  '/communities/*/members/signup',
  '/communities/*/members/forgot-password'
];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  }
});

const isPublicRoute = (path: string) => {
  for (const route of publicRoutes) {
    const pattern = new RegExp('^' + route.replace(/\*/g, '[^/]+') + '$');
    if (pattern.test(path)) {
      return true;
    }
  }
  return false;
};

const isMemberRoute = (path: string) => {
  return path.includes('/engagement/') || path.includes('/member/') || path.includes('/members/');
};

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const memberToken = localStorage.getItem('memberToken');
    const currentPath = config.url?.replace(config.baseURL || '', '') || '';
    
    const isPublic = isPublicRoute(currentPath);
    const isMember = isMemberRoute(currentPath);

    console.log('Configuração da requisição:', {
      path: currentPath,
      method: config.method,
      isPublic,
      isMember,
      hasToken: !!token,
      hasMemberToken: !!memberToken
    });

    if (config.headers) {
      if (isMember && memberToken) {
        config.headers['Authorization'] = `Bearer ${memberToken}`;
      } else if (!isPublic && token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  error => {
    console.error('Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Se receber 401 em uma rota de membro, redireciona para o login
      if (error.response.status === 401 && isMemberRoute(error.config.url || '')) {
        const communityId = localStorage.getItem('communityId');
        if (communityId) {
          window.location.href = `/communities/${communityId}/member/login`;
        }
      }

      console.error('Erro na resposta da API:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers
        }
      });
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api; 