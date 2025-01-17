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
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

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

  const { control, handleSubmit, reset, watch } = useForm<CheckInRequest>();

  const searchMember = async () => {
    if (!activeCommunity || !searchTerm) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Buscando membro:', searchTerm);
      const response = await MemberService.findByEmailOrPhone(activeCommunity.id, searchTerm);
      console.log('Resposta da busca:', response);
      
      if (response.member) {
        setSelectedMember(response.member);
        // Buscar família do membro
        if (response.member.id) {
          const familyResponse = await MemberService.getMemberFamily(activeCommunity.id, response.member.id);
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
                <Typography variant="h6" gutterBottom>
                  QR Code para Check-in
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <QrCode2Icon sx={{ fontSize: 200 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" align="center">
                  Escaneie este QR Code para realizar o check-in no evento
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 