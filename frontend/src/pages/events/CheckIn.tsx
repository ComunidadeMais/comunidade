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

  const { control, handleSubmit, reset, watch } = useForm<CheckInRequest>();

  // Gera a URL de check-in do evento
  const checkInUrl = `${window.location.origin}/events/${eventId}/checkin`;

  // Função para buscar o nome do evento
  useEffect(() => {
    const fetchEventName = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/events/${eventId}/public`);
        const data = await response.json();
        setEventName(data.event?.name || 'Evento');
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
    } catch (err) {
      console.error('Erro ao buscar membro:', err);
      setError('Erro ao buscar membro');
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
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Check-in do Evento
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
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
                    />
                  }
                  label="Sou visitante"
                />

                {!isVisitor && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Buscar membro por e-mail ou telefone
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Digite o e-mail ou telefone"
                      />
                      <Button
                        variant="contained"
                        onClick={searchMember}
                        disabled={loading}
                        startIcon={<SearchIcon />}
                      >
                        Buscar
                      </Button>
                    </Box>
                  </Box>
                )}

                {selectedMember && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Membro Encontrado
                    </Typography>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{selectedMember.name}</Typography>
                        <Typography color="textSecondary">{selectedMember.email}</Typography>
                        <Typography color="textSecondary">{selectedMember.phone}</Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {familyMembers.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
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
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Realizar Check-in'}
                </Button>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    QR Code para Check-in
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintQRCode}
                  >
                    Imprimir QR Code
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <QRCodeSVG value={checkInUrl} size={200} />
                </Box>
                <Typography variant="body2" color="text.secondary" align="center">
                  Escaneie este QR Code para realizar o check-in no evento
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {checkInUrl}
                </Typography>
              </CardContent>
            </Card>

            {/* Componente oculto para impressão */}
            <PrintableQRCode url={checkInUrl} eventName={eventName} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 