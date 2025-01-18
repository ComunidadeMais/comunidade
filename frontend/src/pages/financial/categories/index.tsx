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
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { financialService } from '../../../services/financial';
import { FinancialCategory } from '../../../types/financial';
import PageHeader from '../../../components/PageHeader';

export default function FinancialCategories() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FinancialCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'expense' | 'revenue',
    description: '',
  });

  const handleEdit = (category: FinancialCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (category: FinancialCategory) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await financialService.deleteCategory(selectedCommunity.id, category.id);
        enqueueSnackbar('Categoria excluída com sucesso', { variant: 'success' });
        loadCategories();
      } catch (err: any) {
        const error = err.response?.data;
        
        if (err.response?.status === 409 && error) {
          const detailMessage = `${error.error}\n\nDetalhes:\n` +
            `${error.details.expenses_count} despesa(s)\n` +
            `${error.details.revenues_count} receita(s)`;
          
          setErrorMessage(detailMessage);
          setOpenErrorDialog(true);
        } else {
          enqueueSnackbar('Erro ao excluir categoria', { variant: 'error' });
        }
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {params.value === 'expense' ? 'Despesa' : 'Receita'}
        </Typography>
      ),
    },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Criado em',
      width: 180,
      renderCell: (params) => (
        <Typography>
          {format(new Date(params.value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  const loadCategories = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await financialService.listCategories(selectedCommunity.id);
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      enqueueSnackbar('Erro ao carregar categorias', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      if (selectedCategory) {
        await financialService.updateCategory(selectedCommunity.id, selectedCategory.id, formData);
        enqueueSnackbar('Categoria atualizada com sucesso', { variant: 'success' });
      } else {
        await financialService.createCategory(selectedCommunity.id, formData);
        enqueueSnackbar('Categoria criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedCategory(null);
      setFormData({ name: '', type: 'expense', description: '' });
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      enqueueSnackbar('Erro ao salvar categoria', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({ name: '', type: 'expense', description: '' });
  };

  return (
    <Box>
      <PageHeader
        title="Categorias Financeiras"
        subtitle="Gerencie as categorias de despesas e receitas"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Categoria
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={categories}
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
            {selectedCategory ? 'Editar Categoria Financeira' : 'Nova Categoria Financeira'}
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
                  select
                  label="Tipo"
                  fullWidth
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'revenue' })}
                >
                  <MenuItem value="expense">Despesa</MenuItem>
                  <MenuItem value="revenue">Receita</MenuItem>
                </TextField>
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
          Erro ao excluir categoria
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