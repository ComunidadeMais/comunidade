const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  uploadsURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads` : 'http://localhost:8080/uploads',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const formatImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_CONFIG.uploadsURL}/${path}`;
};

export default API_CONFIG; 