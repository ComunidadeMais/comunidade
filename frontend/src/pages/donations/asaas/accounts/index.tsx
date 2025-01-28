import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
import { donationService, AsaasAccount } from '../../../../services/donation';
import { useConfirm } from '../../../../hooks/useConfirm';

const companyTypes = [
  { value: 'MEI', label: 'MEI' },
  { value: 'ME', label: 'ME' },
  { value: 'EIRELI', label: 'EIRELI' },
  { value: 'LTDA', label: 'LTDA' },
];

export default function AsaasAccounts() {
  const { communityId } = useParams<{ communityId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  
  const [accounts, setAccounts] = useState<AsaasAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AsaasAccount | null>(null);
  const [formData, setFormData] = useState<Partial<AsaasAccount>>({});

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await donationService.listAsaasAccounts(communityId!);
      setAccounts(response.accounts);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar contas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [communityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAccount) {
        await donationService.updateAsaasAccount(communityId!, selectedAccount.id, formData);
        enqueueSnackbar('Conta atualizada com sucesso', { variant: 'success' });
      } else {
        await donationService.createAsaasAccount(communityId!, formData);
        enqueueSnackbar('Conta criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      loadAccounts();
    } catch (error) {
      enqueueSnackbar('Erro ao salvar conta', { variant: 'error' });
    }
  };

  const handleDelete = async (account: AsaasAccount) => {
    if (await confirm('Deseja realmente excluir esta conta?')) {
      try {
        await donationService.deleteAsaasAccount(communityId!, account.id);
        enqueueSnackbar('Conta excluída com sucesso', { variant: 'success' });
        loadAccounts();
      } catch (error) {
        enqueueSnackbar('Erro ao excluir conta', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'cpf_cnpj', headerName: 'CPF/CNPJ', flex: 1 },
    { field: 'company_type', headerName: 'Tipo', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => {
            setSelectedAccount(params.row);
            setFormData(params.row);
            setOpenDialog(true);
          }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Contas ASAAS</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedAccount(null);
                setFormData({});
                setOpenDialog(true);
              }}
            >
              Nova Conta
            </Button>
          </Box>

          <DataGrid
            rows={accounts}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedAccount ? 'Editar Conta' : 'Nova Conta'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome"
                  fullWidth
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  required
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="CPF/CNPJ"
                  fullWidth
                  required
                  value={formData.cpf_cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Tipo de Empresa"
                  fullWidth
                  required
                  value={formData.company_type || ''}
                  onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                >
                  {companyTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Telefone"
                  fullWidth
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Celular"
                  fullWidth
                  value={formData.mobile_phone || ''}
                  onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Endereço"
                  fullWidth
                  required
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Número"
                  fullWidth
                  required
                  value={formData.address_number || ''}
                  onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Complemento"
                  fullWidth
                  value={formData.complement || ''}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Bairro"
                  fullWidth
                  required
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="CEP"
                  fullWidth
                  required
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 