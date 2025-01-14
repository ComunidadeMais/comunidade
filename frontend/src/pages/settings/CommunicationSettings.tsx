import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Switch, 
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useCommunity } from '../../contexts/CommunityContext';
import api from '../../services/api';

interface CommunicationSettings {
  id?: string;
  email_enabled: boolean;
  email_smtp_host: string;
  email_smtp_port: number;
  email_username: string;
  email_password: string;
  email_from_name: string;
  email_from_address: string;
  sms_enabled: boolean;
  sms_provider: string;
  sms_api_key: string;
  whatsapp_enabled: boolean;
  whatsapp_provider: string;
  whatsapp_api_key: string;
}

const CommunicationSettings: FC = () => {
  const navigate = useNavigate();
  const { activeCommunity, loadCommunities } = useCommunity();
  const [settings, setSettings] = useState<CommunicationSettings>({
    email_enabled: false,
    email_smtp_host: '',
    email_smtp_port: 587,
    email_username: '',
    email_password: '',
    email_from_name: '',
    email_from_address: '',
    sms_enabled: false,
    sms_provider: '',
    sms_api_key: '',
    whatsapp_enabled: false,
    whatsapp_provider: '',
    whatsapp_api_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (activeCommunity) {
      loadSettings();
    }
  }, [activeCommunity]);

  const loadSettings = async () => {
    if (!activeCommunity) return;

    try {
      const response = await api.get(`/communities/${activeCommunity.id}/communications/settings`);
      if (response.data && response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      if (err.response?.status !== 404) {
        setError('Erro ao carregar configurações');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);
    
    try {
      const method = settings.id ? 'put' : 'post';
      const response = await api[method](`/communities/${activeCommunity.id}/communications/settings`, {
        email_enabled: settings.email_enabled,
        email_smtp_host: settings.email_smtp_host,
        email_smtp_port: Number(settings.email_smtp_port),
        email_username: settings.email_username,
        email_password: settings.email_password,
        email_from_name: settings.email_from_name,
        email_from_address: settings.email_from_address,
        sms_enabled: settings.sms_enabled,
        sms_provider: settings.sms_provider,
        sms_api_key: settings.sms_api_key,
        whatsapp_enabled: settings.whatsapp_enabled,
        whatsapp_provider: settings.whatsapp_provider,
        whatsapp_api_key: settings.whatsapp_api_key
      });

      if (response.data) {
        setSuccess('Configurações salvas com sucesso');
        navigate('/settings');
      }
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.response?.data?.error || 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CommunicationSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : field === 'email_smtp_port' 
        ? Number(event.target.value) 
        : event.target.value;
    
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestEmail = async () => {
    if (!activeCommunity) return;

    setTestingEmail(true);
    setTestEmailResult(null);

    try {
      const response = await api.post(`/communities/${activeCommunity.id}/communications/test-email`);
      setTestEmailResult({ success: 'E-mail de teste enviado com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao testar e-mail:', err);
      setTestEmailResult({ 
        error: err.response?.data?.error || 'Erro ao enviar e-mail de teste' 
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (!activeCommunity) {
    return (
      <Box>
        <Typography>Selecione uma comunidade para gerenciar as configurações.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configurações de Comunicação
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Email Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Configurações de E-mail
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email_enabled}
                      onChange={handleChange('email_enabled')}
                    />
                  }
                  label="Habilitar E-mail"
                />
              </Grid>

              {settings.email_enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Host SMTP"
                      value={settings.email_smtp_host}
                      onChange={handleChange('email_smtp_host')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Porta SMTP"
                      type="number"
                      value={settings.email_smtp_port}
                      onChange={handleChange('email_smtp_port')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Usuário"
                      value={settings.email_username}
                      onChange={handleChange('email_username')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Senha"
                      type="password"
                      value={settings.email_password}
                      onChange={handleChange('email_password')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Remetente"
                      value={settings.email_from_name}
                      onChange={handleChange('email_from_name')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="E-mail do Remetente"
                      value={settings.email_from_address}
                      onChange={handleChange('email_from_address')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        startIcon={<SendIcon />}
                        onClick={handleTestEmail}
                        disabled={testingEmail || !settings.email_enabled}
                      >
                        {testingEmail ? 'Testando...' : 'Testar E-mail'}
                      </Button>
                      {testEmailResult?.success && (
                        <Alert severity="success" sx={{ flex: 1 }}>
                          {testEmailResult.success}
                        </Alert>
                      )}
                      {testEmailResult?.error && (
                        <Alert severity="error" sx={{ flex: 1 }}>
                          {testEmailResult.error}
                        </Alert>
                      )}
                    </Stack>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* SMS Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Configurações de SMS
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sms_enabled}
                      onChange={handleChange('sms_enabled')}
                    />
                  }
                  label="Habilitar SMS"
                />
              </Grid>

              {settings.sms_enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Provedor de SMS"
                      value={settings.sms_provider}
                      onChange={handleChange('sms_provider')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Chave da API"
                      value={settings.sms_api_key}
                      onChange={handleChange('sms_api_key')}
                      required
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* WhatsApp Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Configurações do WhatsApp
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.whatsapp_enabled}
                      onChange={handleChange('whatsapp_enabled')}
                    />
                  }
                  label="Habilitar WhatsApp"
                />
              </Grid>

              {settings.whatsapp_enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Provedor de WhatsApp"
                      value={settings.whatsapp_provider}
                      onChange={handleChange('whatsapp_provider')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Chave da API"
                      value={settings.whatsapp_api_key}
                      onChange={handleChange('whatsapp_api_key')}
                      required
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </form>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommunicationSettings; 