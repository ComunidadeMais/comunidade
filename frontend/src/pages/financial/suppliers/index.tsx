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
  Divider,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { financialService } from '../../../services/financial';
import { Supplier } from '../../../types/financial';
import PageHeader from '../../../components/PageHeader';
import getGridActions from '../../../components/GridActions';

export default function Suppliers() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    notes: '',
  });

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      cnpj: supplier.cnpj,
      email: supplier.email,
      phone: supplier.phone || '',
      address: supplier.address || '',
      number: supplier.number || '',
      neighborhood: supplier.neighborhood || '',
      city: supplier.city || '',
      state: supplier.state || '',
      zip_code: supplier.zip_code || '',
      notes: supplier.notes || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await financialService.deleteSupplier(selectedCommunity.id, supplier.id);
        enqueueSnackbar('Fornecedor excluído com sucesso', { variant: 'success' });
        loadSuppliers();
      } catch (err: any) {
        const error = err.response?.data;
        
        if (err.response?.status === 409 && error) {
          const detailMessage = `${error.error}\n\nDetalhes:\n` +
            `${error.details.expenses_count} despesa(s)`;
          
          setErrorMessage(detailMessage);
          setOpenErrorDialog(true);
        } else {
          enqueueSnackbar('Erro ao excluir fornecedor', { variant: 'error' });
        }
      }
    }
  };

  const handleCepSearch = async (cep: string) => {
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
          zip_code: cep,
        }));
      } else {
        enqueueSnackbar('CEP não encontrado', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      enqueueSnackbar('Erro ao buscar CEP', { variant: 'error' });
    } finally {
      setLoadingCep(false);
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
      field: 'cnpj', 
      headerName: 'CNPJ', 
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    { 
      field: 'email', 
      headerName: 'E-mail', 
      flex: 1,
      align: 'left',
      headerAlign: 'left',
    },
    { 
      field: 'phone', 
      headerName: 'Telefone', 
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    { 
      field: 'city', 
      headerName: 'Cidade', 
      width: 150,
      align: 'center',
      headerAlign: 'center',
    },
    { 
      field: 'state', 
      headerName: 'Estado', 
      width: 100,
      align: 'center',
      headerAlign: 'center',
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
      width: 100,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => getGridActions({
        onEdit: () => handleEdit(params.row),
        onDelete: () => handleDelete(params.row),
      }),
    },
  ];

  const loadSuppliers = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await financialService.listSuppliers(selectedCommunity.id);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      enqueueSnackbar('Erro ao carregar fornecedores', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCommunity) {
      enqueueSnackbar('Selecione uma comunidade primeiro', { variant: 'error' });
      return;
    }

    try {
      if (selectedSupplier) {
        await financialService.updateSupplier(selectedCommunity.id, selectedSupplier.id, formData);
        enqueueSnackbar('Fornecedor atualizado com sucesso', { variant: 'success' });
      } else {
        console.log('Enviando dados:', { communityId: selectedCommunity.id, formData });
        await financialService.createSupplier(selectedCommunity.id, formData);
        enqueueSnackbar('Fornecedor criado com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedSupplier(null);
      setFormData({
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        notes: '',
      });
      loadSuppliers();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      enqueueSnackbar('Erro ao salvar fornecedor', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      notes: '',
    });
  };

  return (
    <Box>
      <PageHeader
        title="Fornecedores"
        subtitle="Gerencie os fornecedores da comunidade"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Novo Fornecedor
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={suppliers}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Informações Básicas
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="CNPJ"
                  fullWidth
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="E-mail"
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Telefone"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Endereço
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="CEP"
                  fullWidth
                  value={formData.zip_code}
                  onChange={(e) => {
                    const cep = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, zip_code: cep });
                    if (cep.length === 8) {
                      handleCepSearch(cep);
                    }
                  }}
                  InputProps={{
                    endAdornment: loadingCep && <CircularProgress size={20} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Endereço"
                  fullWidth
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Número"
                  fullWidth
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Bairro"
                  fullWidth
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Cidade"
                  fullWidth
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Estado"
                  fullWidth
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Observações
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

      <Dialog 
        open={openErrorDialog} 
        onClose={() => setOpenErrorDialog(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Erro ao excluir fornecedor
        </DialogTitle>
        <DialogContent>
          <Typography 
            sx={{ 
              whiteSpace: 'pre-line',
              mt: 2 
            }}
          >
            {errorMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorDialog(false)} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 