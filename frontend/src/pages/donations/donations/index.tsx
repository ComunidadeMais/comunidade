import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  useTheme,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { donationService } from '../../../services/donation';
import { Donation, Campaign } from '../../../types/donation';
import PageHeader from '../../../components/PageHeader';
import getGridActions from '../../../components/GridActions';
import DonationForm from './DonationForm';

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'pix', label: 'PIX' },
];

const statusColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  cancelled: 'default',
};

const statusLabels: { [key: string]: string } = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export default function Donations() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState('');

  const handleEdit = (donation: Donation) => {
    setSelectedDonation(donation);
    setOpenDialog(true);
  };

  const handleDelete = async (donation: Donation) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta doação?')) {
      try {
        await donationService.deleteDonation(selectedCommunity.id, donation.id);
        enqueueSnackbar('Doação excluída com sucesso', { variant: 'success' });
        loadDonations();
      } catch (error) {
        console.error('Erro ao excluir doação:', error);
        enqueueSnackbar('Erro ao excluir doação', { variant: 'error' });
      }
    }
  };

  const handleViewLink = (donation: Donation) => {
    if (donation.payment_link) {
      setSelectedLink(donation.payment_link);
      setOpenLinkDialog(true);
    } else {
      enqueueSnackbar('Link de pagamento não disponível', { variant: 'warning' });
    }
  };

  const handleSendLink = async (donation: Donation) => {
    if (!selectedCommunity) return;
    
    try {
      await donationService.sendPaymentLink(selectedCommunity.id, donation.id);
      enqueueSnackbar('Link de pagamento enviado com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao enviar link de pagamento:', error);
      enqueueSnackbar('Erro ao enviar link de pagamento', { variant: 'error' });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'campaign_id',
      headerName: 'Campanha',
      width: 200,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => {
        const campaign = campaigns.find(c => c.id === params.value);
        return campaign ? campaign.name : 'Doação Avulsa';
      },
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography align="right" sx={{ width: '100%' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
        </Typography>
      ),
    },
    {
      field: 'payment_method',
      headerName: 'Forma de Pagamento',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const method = paymentMethods.find(m => m.value === params.value);
        return method ? method.label : params.value;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value] || params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'payment_date',
      headerName: 'Data Pagamento',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Typography align="center" sx={{ width: '100%' }}>
            {format(new Date(params.value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Typography>
        ) : '-'
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography align="center" sx={{ width: '100%' }}>
          {format(new Date(params.value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => [
        ...getGridActions({
          onEdit: () => handleEdit(params.row),
          onDelete: () => handleDelete(params.row),
        }),
        <IconButton
          key="link"
          onClick={() => handleViewLink(params.row)}
          title="Ver Link de Pagamento"
          color="primary"
          size="small"
        >
          <LinkIcon />
        </IconButton>,
        <IconButton
          key="email"
          onClick={() => handleSendLink(params.row)}
          title="Enviar Link por E-mail"
          color="primary"
          size="small"
        >
          <EmailIcon />
        </IconButton>,
      ],
    },
  ];

  const loadCampaigns = async () => {
    if (!selectedCommunity) return;
    
    try {
      const data = await donationService.listCampaigns(selectedCommunity.id);
      setCampaigns(data || []);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      enqueueSnackbar('Erro ao carregar campanhas', { variant: 'error' });
    }
  };

  const loadDonations = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const data = await donationService.listDonations(selectedCommunity.id);
      setDonations(data || []);
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      enqueueSnackbar('Erro ao carregar doações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
    loadCampaigns();
  }, [selectedCommunity]);

  const handleSubmit = async (formData: any) => {
    if (!selectedCommunity) return;

    try {
      if (selectedDonation) {
        await donationService.updateDonation(selectedCommunity.id, selectedDonation.id, formData);
        enqueueSnackbar('Doação atualizada com sucesso', { variant: 'success' });
      } else {
        await donationService.createDonation(selectedCommunity.id, formData);
        enqueueSnackbar('Doação criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedDonation(null);
      loadDonations();
    } catch (error) {
      console.error('Erro ao salvar doação:', error);
      enqueueSnackbar('Erro ao salvar doação', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Doações"
        subtitle="Gerencie as doações recebidas"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Doação
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={donations}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            pagination
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </CardContent>
      </Card>

      <DonationForm
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedDonation(null);
        }}
        onSubmit={handleSubmit}
        campaigns={campaigns}
        communityId={selectedCommunity?.id || ''}
        initialData={selectedDonation}
      />

      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)}>
        <DialogTitle>Link de Pagamento</DialogTitle>
        <DialogContent>
          <Link href={selectedLink} target="_blank" rel="noopener noreferrer">
            {selectedLink}
          </Link>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(selectedLink);
              enqueueSnackbar('Link copiado para a área de transferência', { variant: 'success' });
            }}
          >
            Copiar Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 