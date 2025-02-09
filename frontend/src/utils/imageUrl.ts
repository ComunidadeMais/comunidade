export const getImageUrl = (path: string | undefined | null): string | undefined => {
  if (!path) return undefined;
  
  const uploadsUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:8080/uploads';
  return `${uploadsUrl}/${path}`;
}; 