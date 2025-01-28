import { VolunteerActivism as VolunteerActivismIcon } from '@mui/icons-material';

const menuItems = [
  {
    text: 'Campanhas e Doações',
    path: '/donations',
    icon: <VolunteerActivismIcon />,
    description: 'Gestão de campanhas e doações',
    subItems: [
      {
        text: 'Campanhas',
        path: '/donations/campaigns',
        description: 'Campanhas de arrecadação',
      },
      {
        text: 'Doações',
        path: '/donations',
        description: 'Doações recebidas',
      },
      {
        text: 'Doações Recorrentes',
        path: '/donations/recurring',
        description: 'Doações recorrentes',
      },
      {
        text: 'Configurações ASAAS',
        path: '/donations/asaas',
        description: 'Configurações de integração com ASAAS',
      }
    ],
  },
]; 