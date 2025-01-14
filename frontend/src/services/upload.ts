import api from './api';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw new Error(error.response?.data?.message || 'Erro ao fazer upload da imagem');
  }
}; 