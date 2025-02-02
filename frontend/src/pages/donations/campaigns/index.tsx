import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  useTheme,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { donationService } from '../../../services/donation';
import { Campaign } from '../../../types/donation';
import PageHeader from '../../../components/PageHeader';
import getGridActions from '../../../components/GridActions';

export default function Campaigns() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: 0,
    start_date: '',
    end_date: '',
  });

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      goal: campaign.goal,
      start_date: format(new Date(campaign.start_date), 'yyyy-MM-dd'),
      end_date: format(new Date(campaign.end_date), 'yyyy-MM-dd'),
    });
    setOpenDialog(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      try {
        await donationService.deleteCampaign(selectedCommunity.id, campaign.id);
        enqueueSnackbar('Campanha excluída com sucesso', { variant: 'success' });
        loadCampaigns();
      } catch (error) {
        console.error('Erro ao excluir campanha:', error);
        enqueueSnackbar('Erro ao excluir campanha', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Nome', 
      flex: 1,
      align: 'left',
      headerAlign: 'left',
    },
    { 
      field: 'description', 
      headerName: 'Descrição', 
      flex: 1,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'Goal',
      headerName: 'Meta',
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
      field: 'start_date',
      headerName: 'Data Início',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography align="center" sx={{ width: '100%' }}>
          {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'end_date',
      headerName: 'Data Fim',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography align="center" sx={{ width: '100%' }}>
          {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isActive = new Date(params.row.end_date) >= new Date();
        return (
          <Chip 
            label={isActive ? 'Ativa' : 'Encerrada'} 
            color={isActive ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => getGridActions({
        onEdit: () => handleEdit(params.row),
        onDelete: () => handleDelete(params.row),
      }),
    },
  ];

  const loadCampaigns = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const campaigns = await donationService.listCampaigns(selectedCommunity.id);
      setCampaigns(campaigns);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      enqueueSnackbar('Erro ao carregar campanhas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      const formattedData = {
        name: formData.name,
        description: formData.description,
        goal: formData.goal,
        start_date: `${formData.start_date}T00:00:00Z`,
        end_date: `${formData.end_date}T23:59:59Z`,
      };

      if (selectedCampaign) {
        await donationService.updateCampaign(selectedCommunity.id, selectedCampaign.id, formattedData);
        enqueueSnackbar('Campanha atualizada com sucesso', { variant: 'success' });
      } else {
        await donationService.createCampaign(selectedCommunity.id, formattedData);
        enqueueSnackbar('Campanha criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedCampaign(null);
      setFormData({ name: '', description: '', goal: 0, start_date: '', end_date: '' });
      loadCampaigns();
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      enqueueSnackbar('Erro ao salvar campanha', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCampaign(null);
    setFormData({ name: '', description: '', goal: 0, start_date: '', end_date: '' });
  };

  return (
    <Box>
      <PageHeader
        title="Campanhas"
        subtitle="Gerencie as campanhas de arrecadação"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Campanha
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={campaigns}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedCampaign ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Nome"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Meta (R$)"
                  fullWidth
                  required
                  type="number"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data Início"
                  fullWidth
                  required
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data Fim"
                  fullWidth
                  required
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 