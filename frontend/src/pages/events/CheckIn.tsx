import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Autocomplete,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CheckInRequest } from '../../types/checkin';
import checkInService from '../../services/checkin';
import { Member } from '../../types/member';
import { MemberService } from '../../services/member';
import { useCommunity } from '../../contexts/CommunityContext';
import { QRCodeSVG } from 'qrcode.react';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import { useTheme } from '@mui/material/styles';

// Componente para impressão do QR Code
const PrintableQRCode: React.FC<{ url: string, eventName: string }> = ({ url, eventName }) => {
  return (
    <div style={{ display: 'none' }}>
      <div id="printable-qrcode" style={{ 
        width: '210mm', 
        height: '297mm', 
        padding: '20mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '170mm',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10mm'
        }}>
          <h1 style={{ 
            fontSize: '24pt', 
            textAlign: 'center', 
            margin: 0,
            color: '#333'
          }}>
            Check-in do Evento
          </h1>
          <h2 style={{ 
            fontSize: '20pt', 
            textAlign: 'center', 
            margin: 0,
            color: '#666'
          }}>
            {eventName}
          </h2>
          <div style={{ 
            width: '150mm', 
            height: '150mm',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '10mm',
            boxShadow: '0 0 10mm rgba(0,0,0,0.1)',
            borderRadius: '5mm',
            margin: '10mm 0'
          }}>
            <QRCodeSVG value={url} size={567} /> {/* 150mm em pixels (150 * 3.78) */}
          </div>
          <p style={{ 
            fontSize: '14pt', 
            textAlign: 'center',
            margin: '5mm 0',
            maxWidth: '150mm',
            wordBreak: 'break-all',
            color: '#444'
          }}>
            {url}
          </p>
          <p style={{ 
            fontSize: '12pt',
            textAlign: 'center',
            margin: '5mm 0',
            color: '#666',
            fontStyle: 'italic'
          }}>
            Escaneie este QR Code para realizar o check-in no evento
          </p>
        </div>
      </div>
    </div>
  );
};

export const CheckIn: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisitor, setIsVisitor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<Member[]>([]);
  const [eventName, setEventName] = useState<string>('');
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');

  const { control, handleSubmit, reset, watch } = useForm<CheckInRequest>();

  const theme = useTheme();

  // Gera a URL de check-in do evento
  const checkInUrl = `${window.location.origin}/events/${eventId}/checkin`;

  // Função para buscar o nome do evento
  useEffect(() => {
    const fetchEventName = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/events/${eventId}/public`);
        const data = await response.json();
        if (data.event) {
          setEventName(data.event.name || 'Evento');
          setEventTitle(data.event.title || 'Check-in do Evento');
          // Formata a data do evento
          if (data.event.start_date) {
            const date = new Date(data.event.start_date);
            setEventDate(date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            }));
          }
        }
      } catch (err) {
        console.error('Erro ao buscar nome do evento:', err);
      }
    };
    if (eventId) {
      fetchEventName();
    }
  }, [eventId]);

  const searchMember = async () => {
    if (!eventId || !searchTerm) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Buscando membro:', searchTerm);
      const response = await MemberService.findByEmailOrPhone(eventId, searchTerm);
      console.log('Resposta da busca:', response);
      
      if (response.member) {
        setSelectedMember(response.member);
        // Buscar família do membro
        if (response.member.id) {
          const familyResponse = await MemberService.getMemberFamily(eventId, response.member.id);
          console.log('Família do membro:', familyResponse);
          if (familyResponse.family_members) {
            setFamilyMembers(familyResponse.family_members.filter(fm => fm.id !== response.member.id));
          }
        }
      } else {
        setError('Membro não encontrado');
      }
    } catch (err: any) {
      console.error('Erro ao buscar membro:', err);
      setError(err.response?.data?.error || 'Erro ao buscar membro');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CheckInRequest) => {
    try {
      if (!eventId) {
        setError('ID do evento não encontrado');
        return;
      }

      setLoading(true);
      setError(null);

      const checkInData: CheckInRequest = {
        event_id: eventId,
        name: data.name || selectedMember?.name || '',
        email: data.email || selectedMember?.email || '',
        phone: data.phone || selectedMember?.phone || '',
        city: data.city || selectedMember?.city || '',
        district: data.district || '',
        source: data.source || '',
        consent: data.consent || false,
        is_visitor: isVisitor,
        member_id: !isVisitor && selectedMember?.id ? selectedMember.id : undefined,
        family_ids: selectedFamilyMembers.map(member => member.id),
      };

      console.log('Enviando dados de check-in:', checkInData);
      const response = await checkInService.create(checkInData);
      console.log('Resposta do check-in:', response);
      setSuccess(true);
      reset();
      setSelectedMember(null);
      setSelectedFamilyMembers([]);
      setFamilyMembers([]);
    } catch (err: any) {
      console.error('Erro ao realizar check-in:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao realizar check-in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFamilyMemberToggle = (member: Member) => {
    setSelectedFamilyMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  // Função para imprimir o QR Code
  const handlePrintQRCode = () => {
    const printContent = document.getElementById('printable-qrcode')?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${eventName}</title>
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box 
        sx={{ 
          mt: 4, 
          mb: 6,
          textAlign: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '4px',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="div" 
          gutterBottom
          sx={{ 
            color: theme.palette.text.secondary,
            mb: 2
          }}
        >
          Evento
        </Typography>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 2
          }}
        >
          {eventTitle}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
            mb: 2
          }}
        >
          Este é um evento oficial de {activeCommunity?.name || 'Comunidade Hugo'}
        </Typography>
        {eventDate && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 500,
              maxWidth: '600px',
              margin: '0 auto',
              textTransform: 'capitalize'
            }}
          >
            {eventDate}
          </Typography>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Formulário de Check-in */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isVisitor}
                      onChange={(e) => {
                        setIsVisitor(e.target.checked);
                        setSelectedMember(null);
                        setFamilyMembers([]);
                        setSelectedFamilyMembers([]);
                      }}
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Sou visitante
                    </Typography>
                  }
                />
              </Box>

              {!isVisitor && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    Buscar membro
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Digite o e-mail ou telefone"
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={searchMember}
                      disabled={loading}
                      startIcon={<SearchIcon />}
                      sx={{ 
                        minWidth: '120px',
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      }}
                    >
                      Buscar
                    </Button>
                  </Box>
                </Box>
              )}

              {selectedMember && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    Membro Encontrado
                  </Typography>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                        {selectedMember.name}
                      </Typography>
                      <Typography color="textSecondary">{selectedMember.email}</Typography>
                      <Typography color="textSecondary">{selectedMember.phone}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {familyMembers.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    Membros da Família
                  </Typography>
                  <List>
                    {familyMembers.map((member) => (
                      <ListItem key={member.id}>
                        <ListItemText
                          primary={member.name}
                          secondary={`${member.email} - ${member.phone}`}
                        />
                        <ListItemSecondaryAction>
                          <Checkbox
                            edge="end"
                            onChange={() => handleFamilyMemberToggle(member)}
                            checked={selectedFamilyMembers.some(m => m.id === member.id)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {(isVisitor || !selectedMember) && (
                <>
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=""
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nome completo"
                        margin="normal"
                        fullWidth
                        required
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{ required: true, pattern: /^\S+@\S+$/i }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="E-mail"
                        type="email"
                        margin="normal"
                        fullWidth
                        required
                      />
                    )}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    defaultValue=""
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Telefone"
                        margin="normal"
                        fullWidth
                        required
                      />
                    )}
                  />
                </>
              )}

              {isVisitor && (
                <>
                  <Controller
                    name="city"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cidade"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="district"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bairro"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="source"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Como ficou sabendo do evento?"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                </>
              )}

              <Controller
                name="consent"
                control={control}
                defaultValue={false}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                      />
                    }
                    label="Concordo com o uso dos meus dados para fins de registro e comunicação"
                  />
                )}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Check-in realizado com sucesso!
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  mt: 4,
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Realizar Check-in'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* QR Code */}
        <Grid item xs={12} md={5}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4 
              }}>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                  QR Code para Check-in
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintQRCode}
                  sx={{ 
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Imprimir
                </Button>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                p: 3,
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0 0 20px rgba(0,0,0,0.05)'
              }}>
                <QRCodeSVG value={checkInUrl} size={250} />
                <Typography variant="body1" color="textSecondary" align="center">
                  Escaneie este QR Code para realizar o check-in no evento
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    wordBreak: 'break-all',
                    textAlign: 'center'
                  }}
                >
                  {checkInUrl}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ 
        mt: 8, 
        pt: 4,
        borderTop: `2px solid ${theme.palette.divider}`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Para mais informações, entre em contato conosco.
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            fontWeight: 500
          }}
        >
          Criado por{' '}
          <Button
            component="a"
            href="/"
            sx={{ 
              color: theme.palette.primary.main,
              p: 0,
              minWidth: 'auto',
              fontStyle: 'italic',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              }
            }}
          >
            Comunidade+
          </Button>
        </Typography>
      </Box>

      {/* Componente oculto para impressão */}
      <PrintableQRCode url={checkInUrl} eventName={eventName} />
    </Container>
  );
}; 