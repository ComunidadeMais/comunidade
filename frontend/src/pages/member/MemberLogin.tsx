import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MotionCard = motion(Card);

interface CommunityData {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
}

interface SignUpFormData {
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface CommunityResponse {
  community: {
    id: string;
    name: string;
    description: string;
    logo?: string;
    banner?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    type?: string;
    status?: string;
  };
}

const MemberLogin: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const { login, setCurrentCommunity } = useAuth();
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: '',
    name: '',
    logo: '',
    banner: '',
    description: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    const loadCommunityData = async () => {
      if (!communityId) {
        console.error('ID da comunidade não fornecido');
        setError('ID da comunidade inválido');
        return;
      }

      try {
        setLoading(true);
        console.log('Tentando carregar dados da comunidade:', communityId);
        
        const response = await api.get<CommunityResponse>(`/communities/${communityId}/public`);
        console.log('Resposta da API:', response.data);
        
        const { community } = response.data;
        
        if (!community) {
          console.error('Dados da comunidade não encontrados na resposta');
          setError('Comunidade não encontrada');
          return;
        }

        setCurrentCommunity({
          id: community.id,
          name: community.name,
          logo: community.logo
        });
        
        setCommunityData({
          id: community.id,
          name: community.name,
          logo: community.logo || '',
          banner: community.banner || '',
          description: community.description || '',
          address: community.address || '',
          city: community.city || '',
          state: community.state || '',
          phone: '',
          email: '',
          website: ''
        });
        
        setError(null);
      } catch (error: any) {
        console.error('Erro detalhado ao carregar dados da comunidade:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 404) {
          setError('Comunidade não encontrada');
        } else if (error.response?.status === 500) {
          setError('Erro interno do servidor ao carregar dados da comunidade');
        } else {
          setError('Erro ao carregar dados da comunidade');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCommunityData();
  }, [communityId, setCurrentCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post(`/communities/${communityId}/members/login`, {
        login: email,
        password,
      });

      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      const { token } = response.data;
      if (!token) {
        setError('Token de autenticação não recebido');
        return;
      }

      login(token);
      navigate(`/communities/${communityId}/member/dashboard`);
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('As senhas não conferem');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/communities/${communityId}/members/signup`, {
        community_id: communityId,
        cpf: signUpData.cpf,
        email: signUpData.email,
        password: signUpData.password,
      });
      setSignUpOpen(false);
      setError('Cadastro realizado com sucesso! Faça login para continuar.');
    } catch (error: any) {
      setSignUpError(error.response?.data?.error || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.background.default,
        padding: 3
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/* Lado esquerdo - Informações da Comunidade */}
          <Box
            sx={{
              flex: '1',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.primary.main,
              color: 'white',
              position: 'relative'
            }}
          >
            {communityData.banner && (
              <Box
                component="img"
                src={communityData.banner}
                alt="Banner"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.1
                }}
              />
            )}
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
                zIndex: 1
              }}
            >
              {communityData.logo && (
                <Avatar
                  src={communityData.logo}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 3,
                    mx: 'auto',
                    border: '4px solid white'
                  }}
                />
              )}
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                {communityData.name}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                Portal do Membro
              </Typography>
              {communityData.description && (
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {communityData.description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Lado direito - Formulário de Login */}
          <Box
            sx={{
              flex: '1',
              p: 4,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom textAlign="center">
              Acesse sua conta
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-mail"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Entrar'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setSignUpOpen(true)}
                  sx={{ mb: 1, display: 'block' }}
                >
                  Primeiro acesso? Cadastre-se
                </Link>
                <Link href="#" variant="body2">
                  Esqueceu sua senha?
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Modal de Cadastro */}
        <Dialog open={signUpOpen} onClose={() => setSignUpOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Primeiro Acesso ao Portal</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Para criar sua senha de acesso, informe seu CPF e email cadastrados na comunidade.
            </Typography>

            {signUpError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {signUpError}
              </Alert>
            )}

            <form onSubmit={handleSignUpSubmit}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={signUpData.cpf}
                onChange={handleSignUpChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={signUpData.email}
                onChange={handleSignUpChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Senha"
                name="password"
                type="password"
                value={signUpData.password}
                onChange={handleSignUpChange}
                margin="normal"
                required
                helperText="Mínimo de 6 caracteres"
              />
              <TextField
                fullWidth
                label="Confirme a Senha"
                name="confirmPassword"
                type="password"
                value={signUpData.confirmPassword}
                onChange={handleSignUpChange}
                margin="normal"
                required
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSignUpOpen(false)}>Cancelar</Button>
            <Button onClick={handleSignUpSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MemberLogin; 