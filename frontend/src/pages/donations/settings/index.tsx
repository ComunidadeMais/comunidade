import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { donationService } from '../../../services/donation';
import { AsaasConfig } from '../../../types/donation';
import PageHeader from '../../../components/PageHeader';

export default function DonationSettings() {
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AsaasConfig>({
    id: '',
    api_key: '',
    sandbox: true,
    webhook_token: '',
    created_at: '',
    updated_at: '',
  });

  const loadConfig = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await donationService.getAsaasConfig(selectedCommunity.id);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      enqueueSnackbar('Erro ao carregar configurações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      await donationService.updateAsaasConfig(selectedCommunity.id, {
        api_key: formData.api_key,
        sandbox: formData.sandbox,
        webhook_token: formData.webhook_token,
      });
      enqueueSnackbar('Configurações salvas com sucesso', { variant: 'success' });
      loadConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      enqueueSnackbar('Erro ao salvar configurações', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Configurações de Doações"
        subtitle="Configure a integração com o Asaas"
      />

      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Configuração do Asaas</AlertTitle>
            Para receber doações, você precisa configurar sua integração com o Asaas.
            Acesse sua conta no Asaas para obter as credenciais necessárias.
          </Alert>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Chave de API"
                  fullWidth
                  required
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  helperText="Chave de API fornecida pelo Asaas"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Token do Webhook"
                  fullWidth
                  value={formData.webhook_token || ''}
                  onChange={(e) => setFormData({ ...formData, webhook_token: e.target.value })}
                  helperText="Token para validação dos webhooks (opcional)"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sandbox}
                      onChange={(e) => setFormData({ ...formData, sandbox: e.target.checked })}
                    />
                  }
                  label="Ambiente de Testes (Sandbox)"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Ative para usar o ambiente de testes do Asaas
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  Salvar Configurações
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 