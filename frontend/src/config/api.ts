const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  uploadsURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/uploads` : 'http://localhost:8080/api/v1/uploads',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const formatImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Se o caminho já incluir um subdiretório (como communities/logos), usa o caminho como está
  if (path.includes('/')) {
    return `${API_CONFIG.uploadsURL}/${path}`;
  }
  
  // Se for apenas o nome do arquivo, assume que é uma imagem de post
  return `${API_CONFIG.uploadsURL}/posts/${path}`;
};

export default API_CONFIG; 