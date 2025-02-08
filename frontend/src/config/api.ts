const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  uploadsURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads` : 'http://localhost:8080/uploads',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const formatImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';

  // Extrai apenas o nome do arquivo e subdiretório se houver
  let cleanPath = path;
  
  // Remove qualquer URL base completa se existir
  if (cleanPath.includes('localhost:8080')) {
    cleanPath = cleanPath.split('localhost:8080/')[1];
  }
  
  // Remove 'uploads/' ou '/uploads/' do caminho
  cleanPath = cleanPath.replace(/^\/?(uploads\/|api\/v1\/uploads\/)/g, '');
  
  // Remove qualquer http:// ou https:// restante
  cleanPath = cleanPath.replace(/^https?:\/\//g, '');
  
  // Agora temos apenas o subdiretório (se houver) e o nome do arquivo
  return `${API_CONFIG.uploadsURL}/${cleanPath}`;
};

export default API_CONFIG; 