import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider,
  Avatar,
  SelectChangeEvent
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MemberService } from '../services/member';
import { FamilyService } from '../services/family';
import { Member } from '../types/member';
import { Family, FamilyRoles, FamilyRoleValues } from '../types/family';
import { useCommunity } from '../contexts/CommunityContext';
import { AuthService } from '../services/auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MemberForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [families, setFamilies] = useState<Family[]>([]);
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    type: 'regular',
    status: 'pending',
    joinDate: new Date().toISOString(),
    birthDate: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    notes: '',
    emergencyContact: '',
    emergencyPhone: '',
    ministry: '',
    ministryRole: '',
    ministryStartDate: '',
    isVolunteer: false,
    skills: [],
    interests: [],
    familyId: '',
    familyRole: '',
    baptismDate: '',
    baptismLocation: '',
    membershipDate: '',
    membershipType: '',
    previousChurch: '',
    transferredFrom: '',
    transferredTo: '',
    transferDate: '',
    notifyByEmail: true,
    notifyByPhone: false,
    notifyByWhatsApp: false,
    allowPhotos: true,
    isSubscribedToNewsletter: true
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AuthService.getProfile();
        console.log('User data:', userData);
        if (userData?.id) {
          setFormData(prev => ({
            ...prev,
            userId: userData.id
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setError('Erro ao carregar dados do usuário. Por favor, tente novamente.');
      }
    };

    if (!id) {
      loadUser();
    }
  }, [id]);

  useEffect(() => {
    const loadMember = async () => {
      if (!activeCommunity) return;
      
      setLoading(true);
      setError(null);
      try {
        // Carrega os dados do membro
        const memberResponse = await MemberService.getMember(activeCommunity.id, id!);
        console.log('Dados do membro:', memberResponse);
        
        if (!memberResponse) {
          throw new Error('Dados do membro não encontrados');
        }

        // Carrega os dados da família do membro
        let familyData = null;
        try {
          const familyMemberResponse = await MemberService.getFamilyMember(activeCommunity.id, id!);
          console.log('Dados da família do membro:', familyMemberResponse);
          if (familyMemberResponse) {
            familyData = {
              familyId: familyMemberResponse.family_id,
              familyRole: familyMemberResponse.role
            };
          }
        } catch (err) {
          console.log('Membro não pertence a nenhuma família');
        }
        
        const formattedData = {
          // Dados básicos
          userId: memberResponse.user_id || '',
          name: memberResponse.name || '',
          email: memberResponse.email || '',
          phone: memberResponse.phone || '',
          role: memberResponse.role || 'member',
          type: memberResponse.type || 'regular',
          status: memberResponse.status || 'active',
          
          // Datas - Tratamento especial para datas inválidas
          joinDate: memberResponse.join_date ? new Date(memberResponse.join_date).toISOString().split('T')[0] : '',
          birthDate: memberResponse.birth_date && !memberResponse.birth_date.startsWith('0000') ? new Date(memberResponse.birth_date).toISOString().split('T')[0] : '',
          ministryStartDate: memberResponse.ministry_start_date && !memberResponse.ministry_start_date.startsWith('0000') ? new Date(memberResponse.ministry_start_date).toISOString().split('T')[0] : '',
          baptismDate: memberResponse.baptism_date && !memberResponse.baptism_date.startsWith('0000') ? new Date(memberResponse.baptism_date).toISOString().split('T')[0] : '',
          membershipDate: memberResponse.membership_date && !memberResponse.membership_date.startsWith('0000') ? new Date(memberResponse.membership_date).toISOString().split('T')[0] : '',
          transferDate: memberResponse.transfer_date && !memberResponse.transfer_date.startsWith('0000') ? new Date(memberResponse.transfer_date).toISOString().split('T')[0] : '',
          
          // Informações pessoais
          gender: memberResponse.gender || '',
          maritalStatus: memberResponse.marital_status || '',
          occupation: memberResponse.occupation || '',
          
          // Endereço
          address: memberResponse.address || '',
          city: memberResponse.city || '',
          state: memberResponse.state || '',
          country: memberResponse.country || '',
          zipCode: memberResponse.zip_code || '',
          
          // Contatos de emergência
          emergencyContact: memberResponse.emergency_contact || '',
          emergencyPhone: memberResponse.emergency_phone || '',
          
          // Notas
          notes: memberResponse.notes || '',
          
          // Ministério
          ministry: memberResponse.ministry || '',
          ministryRole: memberResponse.ministry_role || '',
          isVolunteer: memberResponse.is_volunteer || false,
          skills: memberResponse.skills || [],
          interests: memberResponse.interests || [],
          
          // Família
          familyId: familyData?.familyId || '',
          familyRole: familyData?.familyRole || '',
          
          // Igreja
          baptismLocation: memberResponse.baptism_location || '',
          membershipType: memberResponse.membership_type || '',
          previousChurch: memberResponse.previous_church || '',
          transferredFrom: memberResponse.transferred_from || '',
          transferredTo: memberResponse.transferred_to || '',
          
          // Comunicação
          notifyByEmail: memberResponse.notify_by_email || false,
          notifyByPhone: memberResponse.notify_by_phone || false,
          notifyByWhatsApp: memberResponse.notify_by_whatsapp || false,
          allowPhotos: memberResponse.allow_photos || false,
          isSubscribedToNewsletter: memberResponse.is_subscribed_to_newsletter || false
        };
        
        console.log('Dados formatados para o frontend:', formattedData);
        setFormData(formattedData);
      } catch (err: any) {
        console.error('Erro ao carregar membro:', err);
        setError(err.message || 'Erro ao carregar membro');
      } finally {
        setLoading(false);
      }
    };

    if (id && activeCommunity) {
      loadMember();
    }
  }, [id, activeCommunity]);

  useEffect(() => {
    const loadFamilies = async () => {
      if (!activeCommunity) return;
      
      try {
        const data = await FamilyService.listFamilies(activeCommunity.id);
        console.log('Famílias carregadas:', data);
        setFamilies(data);
      } catch (err) {
        console.error('Erro ao carregar famílias:', err);
      }
    };

    loadFamilies();
  }, [activeCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;
    
    if (!id && !formData.userId) {
      setError('Erro: ID do usuário não encontrado. Por favor, recarregue a página.');
      return;
    }

    const formattedData = {
      user_id: formData.userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      role: formData.role || "member",
      type: formData.type || "regular",
      status: formData.status || "active",
      join_date: formData.joinDate ? new Date(formData.joinDate).toISOString() : new Date().toISOString(),
      birth_date: formData.birthDate ? new Date(formData.birthDate + "T00:00:00").toISOString() : null,
      gender: formData.gender || "",
      marital_status: formData.maritalStatus || "",
      occupation: formData.occupation || "",
      address: formData.address || "",
      city: formData.city || "",
      state: formData.state || "",
      country: formData.country || "",
      zip_code: formData.zipCode || "",
      notes: formData.notes || "",
      emergency_contact: formData.emergencyContact || "",
      emergency_phone: formData.emergencyPhone || "",

      // Campos de ministério
      ministry: formData.ministry || "",
      ministry_role: formData.ministryRole || "",
      ministry_start_date: formData.ministryStartDate ? new Date(formData.ministryStartDate).toISOString() : null,
      is_volunteer: Boolean(formData.isVolunteer),
      skills: formData.skills || [],
      interests: formData.interests || [],

      // Campos de família
      family_role: formData.familyRole || "",

      // Campos de batismo e membresia
      baptism_date: formData.baptismDate ? new Date(formData.baptismDate).toISOString() : null,
      baptism_location: formData.baptismLocation || "",
      membership_date: formData.membershipDate ? new Date(formData.membershipDate).toISOString() : null,
      membership_type: formData.membershipType || "",
      previous_church: formData.previousChurch || "",
      transferred_from: formData.transferredFrom || "",
      transferred_to: formData.transferredTo || "",
      transfer_date: formData.transferDate ? new Date(formData.transferDate).toISOString() : null,

      // Campos de comunicação
      notify_by_email: Boolean(formData.notifyByEmail),
      notify_by_phone: Boolean(formData.notifyByPhone),
      notify_by_whatsapp: Boolean(formData.notifyByWhatsApp),
      allow_photos: Boolean(formData.allowPhotos),
      is_subscribed_to_newsletter: Boolean(formData.isSubscribedToNewsletter)
    };

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let savedMember;
      if (id) {
        savedMember = await MemberService.updateMember(activeCommunity.id, id, formattedData);
      } else {
        savedMember = await MemberService.createMember(activeCommunity.id, formattedData);
      }

      // Se tiver família selecionada, adiciona o membro à família
      if (formData.familyId && formData.familyRole && savedMember.id) {
        try {
          await FamilyService.addMember(
            activeCommunity.id,
            formData.familyId,
            savedMember.id,
            formData.familyRole
          );
        } catch (err: any) {
          console.error('Erro ao adicionar membro à família:', err);
          setError('Membro salvo, mas houve um erro ao adicionar à família');
          return;
        }
      }

      setSuccess('Membro salvo com sucesso!');
      navigate('/members');
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.details || err.response?.data?.message || 'Erro ao salvar membro');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name!]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar seus membros
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/members')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              {id ? 'Editar Membro' : 'Novo Membro'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            Salvar
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Informações Básicas" />
              <Tab label="Contato e Endereço" />
              <Tab label="Igreja" />
              <Tab label="Família" />
              <Tab label="Ministério" />
              <Tab label="Comunicação" />
            </Tabs>
          </Box>

          <CardContent>
            <form>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Função</InputLabel>
                      <Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        label="Função"
                        required
                      >
                        <MenuItem value="member">Membro</MenuItem>
                        <MenuItem value="leader">Líder</MenuItem>
                        <MenuItem value="admin">Administrador</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        label="Tipo"
                        required
                      >
                        <MenuItem value="regular">Regular</MenuItem>
                        <MenuItem value="visitor">Visitante</MenuItem>
                        <MenuItem value="transferred">Transferido</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Status"
                        required
                      >
                        <MenuItem value="active">Ativo</MenuItem>
                        <MenuItem value="pending">Pendente</MenuItem>
                        <MenuItem value="inactive">Inativo</MenuItem>
                        <MenuItem value="blocked">Bloqueado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Ingresso"
                      name="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Data de Nascimento"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gênero</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gênero"
                      >
                        <MenuItem value="male">Masculino</MenuItem>
                        <MenuItem value="female">Feminino</MenuItem>
                        <MenuItem value="other">Outro</MenuItem>
                        <MenuItem value="not_specified">Prefiro não informar</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Endereço"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estado"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="País"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CEP"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Contato de Emergência
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nome do Contato de Emergência"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefone de Emergência"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data de Batismo"
                      name="baptismDate"
                      type="date"
                      value={formData.baptismDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Local do Batismo"
                      name="baptismLocation"
                      value={formData.baptismLocation}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data de Membresia"
                      name="membershipDate"
                      type="date"
                      value={formData.membershipDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tipo de Membresia"
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Igreja Anterior"
                      name="previousChurch"
                      value={formData.previousChurch}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Transferido De"
                      name="transferredFrom"
                      value={formData.transferredFrom}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Transferido Para"
                      name="transferredTo"
                      value={formData.transferredTo}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Data de Transferência"
                      name="transferDate"
                      type="date"
                      value={formData.transferDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Família</InputLabel>
                      <Select
                        name="familyId"
                        value={formData.familyId || ''}
                        onChange={handleChange}
                        label="Família"
                      >
                        <MenuItem value="">
                          <em>Nenhuma</em>
                        </MenuItem>
                        {families.map((family) => {
                          console.log('Renderizando família:', family);
                          return (
                            <MenuItem key={family.id} value={family.id}>
                              {family.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Papel na Família</InputLabel>
                      <Select
                        name="familyRole"
                        value={formData.familyRole || ''}
                        onChange={handleChange}
                        label="Papel na Família"
                        disabled={!formData.familyId}
                      >
                        <MenuItem value="">
                          <em>Nenhum</em>
                        </MenuItem>
                        {Object.entries(FamilyRoles).map(([key, label]) => (
                          <MenuItem key={key} value={FamilyRoleValues[key as keyof typeof FamilyRoleValues]}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ministério"
                      name="ministry"
                      value={formData.ministry}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Função no Ministério"
                      name="ministryRole"
                      value={formData.ministryRole}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data de Início no Ministério"
                      name="ministryStartDate"
                      type="date"
                      value={formData.ministryStartDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isVolunteer}
                          onChange={handleSwitchChange}
                          name="isVolunteer"
                        />
                      }
                      label="É voluntário"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Habilidades (separadas por vírgula)"
                      name="skills"
                      value={formData.skills?.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        skills: e.target.value.split(',').map(s => s.trim())
                      }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Interesses (separados por vírgula)"
                      name="interests"
                      value={formData.interests?.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        interests: e.target.value.split(',').map(s => s.trim())
                      }))}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={5}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notifyByEmail}
                          onChange={handleSwitchChange}
                          name="notifyByEmail"
                        />
                      }
                      label="Receber notificações por email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notifyByPhone}
                          onChange={handleSwitchChange}
                          name="notifyByPhone"
                        />
                      }
                      label="Receber notificações por telefone"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notifyByWhatsApp}
                          onChange={handleSwitchChange}
                          name="notifyByWhatsApp"
                        />
                      }
                      label="Receber notificações por WhatsApp"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.allowPhotos}
                          onChange={handleSwitchChange}
                          name="allowPhotos"
                        />
                      }
                      label="Permitir uso de fotos"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isSubscribedToNewsletter}
                          onChange={handleSwitchChange}
                          name="isSubscribedToNewsletter"
                        />
                      }
                      label="Receber newsletter"
                    />
                  </Grid>
                </Grid>
              </TabPanel>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default MemberForm; 