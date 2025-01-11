import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  useTheme,
  InputAdornment,
  Fade
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { AuthService } from '../services/auth';
import { ForgotPasswordRequest } from '../types/user';

const ForgotPassword: FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const request: ForgotPasswordRequest = { email };
      await AuthService.forgotPassword(request);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao solicitar recuperação de senha:', err);
      setError(err.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, #6B2AEE 0%, #5E3AD7 100%)`,
        py: 12,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url(/pattern-comunidade.png) repeat',
          opacity: 0.05,
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 0.05,
          },
          '50%': {
            opacity: 0.08,
          },
        },
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.98)',
              position: 'relative',
              border: '1px solid rgba(107, 42, 238, 0.1)',
              boxShadow: '0 8px 32px rgba(107, 42, 238, 0.1)',
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6B2AEE 0%, #5E3AD7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Recuperar Senha
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    maxWidth: '80%', 
                    mx: 'auto',
                    fontSize: '1rem',
                    lineHeight: 1.5
                  }}
                >
                  Digite seu email para receber as instruções de recuperação de senha
                </Typography>
              </Box>

              {error && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(211, 47, 47, 0.05)',
                    color: '#d32f2f',
                    fontSize: '0.875rem',
                    border: '1px solid rgba(211, 47, 47, 0.1)',
                  }}
                >
                  {error}
                </Box>
              )}

              {success && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(46, 125, 50, 0.05)',
                    color: '#2e7d32',
                    fontSize: '0.875rem',
                    border: '1px solid rgba(46, 125, 50, 0.1)',
                  }}
                >
                  Email enviado com sucesso! Verifique sua caixa de entrada.
                </Box>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(107, 42, 238, 0.02)',
                    '&:hover': {
                      bgcolor: 'rgba(107, 42, 238, 0.05)',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'rgba(107, 42, 238, 0.05)',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(107, 42, 238, 0.2)',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6B2AEE',
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: '#6B2AEE',
                  boxShadow: '0 4px 12px rgba(107, 42, 238, 0.2)',
                  '&:hover': {
                    bgcolor: '#5E3AD7',
                    boxShadow: '0 6px 16px rgba(107, 42, 238, 0.3)',
                  }
                }}
              >
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'rgba(107, 42, 238, 0.7)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#6B2AEE',
                    }
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                  Voltar para o login
                </Link>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPassword; 