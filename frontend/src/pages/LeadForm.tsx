import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Fade,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Church as ChurchIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { sendLeadEmail } from '../services/email';

interface LeadFormData {
  nome: string;
  email: string;
  telefone: string;
  igreja: string;
  funcao: string;
  comoConheceu: string;
  observacao: string;
}

const funcaoOptions = [
  'Pastor(a)',
  'Líder',
  'Secretário(a)',
  'Administrador(a)',
  'Membro',
  'Outro'
];

const comoConheceuOptions = [
  'Google',
  'Redes Sociais',
  'Indicação',
  'Email Marketing',
  'Outro'
];

const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    telefone: '',
    igreja: '',
    funcao: '',
    comoConheceu: '',
    observacao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendLeadEmail(formData);
      setSuccess(true);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        igreja: '',
        funcao: '',
        comoConheceu: '',
        observacao: ''
      });
      setTimeout(() => {
        navigate('/obrigado');
      }, 2000);
    } catch (err) {
      setError('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
      console.error('Erro ao enviar email:', err);
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
      <SEO 
        title="Solicite uma Demonstração"
        description="Preencha o formulário para conhecer o ComunidadeMais - Software completo para gestão de igrejas"
        keywords="demonstração software igreja, teste gestão igreja, software igreja grátis"
      />
      
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
                  Cadastre-se para acessar o Comunidade+
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
                  Preencha os dados abaixo para conhecer o Comunidade+
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

              <TextField
                required
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite seu nome"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
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

              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@gmail.com"
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

              <TextField
                required
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 9 9999-9999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
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

              <TextField
                required
                fullWidth
                label="Igreja"
                name="igreja"
                value={formData.igreja}
                onChange={handleChange}
                placeholder="Digite o nome da sua igreja"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ChurchIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
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

              <TextField
                required
                fullWidth
                select
                label="Função na Igreja"
                name="funcao"
                value={formData.funcao}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
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
              >
                {funcaoOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                required
                fullWidth
                select
                label="Como nos conheceu?"
                name="comoConheceu"
                value={formData.comoConheceu}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
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
              >
                {comoConheceuOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Observação"
                name="observacao"
                multiline
                rows={4}
                value={formData.observacao}
                onChange={handleChange}
                placeholder="Tem alguma observação?"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CommentIcon sx={{ color: 'rgba(107, 42, 238, 0.5)', mt: 1 }} />
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
                {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
              </Button>
            </Box>
          </Paper>
        </Fade>

        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="success"
            sx={{
              borderRadius: 2,
              bgcolor: 'rgba(46, 125, 50, 0.95)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }}
          >
            Dados enviados com sucesso! Entraremos em contato em breve.
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="error"
            sx={{
              borderRadius: 2,
              bgcolor: 'rgba(211, 47, 47, 0.95)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default LeadForm; 