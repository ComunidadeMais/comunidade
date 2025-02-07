export const formatCommunityType = (type: string): string => {
  const types: { [key: string]: string } = {
    'church': 'Igreja',
    'ministry': 'Ministério',
    'organization': 'Organização',
    'business': 'Empresa',
    'other': 'Outro'
  };
  
  return types[type] || type;
};

export const getCommunityTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'church': '#4CAF50', // Verde
    'ministry': '#2196F3', // Azul
    'organization': '#9C27B0', // Roxo
    'business': '#FF9800', // Laranja
    'other': '#757575' // Cinza
  };
  
  return colors[type] || '#757575';
};

export const formatCommunityStatus = (status: string): string => {
  const statuses: { [key: string]: string } = {
    'active': 'Ativa',
    'inactive': 'Inativa',
    'archived': 'Arquivada'
  };
  
  return statuses[status] || status;
};

export const getCommunityStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'active': '#4CAF50', // Verde
    'inactive': '#FFA726', // Laranja
    'archived': '#757575' // Cinza
  };
  
  return colors[status] || '#757575';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL}/uploads/${path}`;
}; 