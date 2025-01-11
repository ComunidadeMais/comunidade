import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { GroupService } from '../services/group';
import { MemberService } from '../services/member';
import { useCommunity } from '../contexts/CommunityContext';
import { Member } from '../types/member';
import { Group, GroupType, GroupStatus, GroupVisibility, GroupTypeLabels, GroupStatusLabels, GroupVisibilityLabels } from '../types/group';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const GroupForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState<Partial<Group>>({
    community_id: '',
    name: '',
    description: '',
    type: GroupType.SMALL_GROUP,
    category: '',
    status: GroupStatus.ACTIVE,
    visibility: GroupVisibility.PUBLIC,
    leader_id: '',
    co_leader_id: '',
    location: '',
    meeting_day: '',
    meeting_time: '',
    frequency: 'weekly',
    max_members: 0,
    min_age: 0,
    max_age: 0,
    gender: '',
    tags: [],
    start_date: new Date().toISOString(),
    allow_guests: true,
    require_approval: false,
    track_attendance: true,
    allow_self_join: true,
    notify_on_join_request: true,
    notify_on_new_member: true,
  });

  useEffect(() => {
    if (activeCommunity) {
      setFormData(prev => ({
        ...prev,
        community_id: activeCommunity.id
      }));
      loadMembers();
      if (id) {
        loadGroup();
      }
    }
  }, [activeCommunity, id]);

  const loadGroup = async () => {
    if (!activeCommunity || !id) return;

    try {
      const data = await GroupService.getGroup(activeCommunity.id, id);
      setFormData(data.group);
    } catch (err: any) {
      console.error('Erro ao carregar grupo:', err);
      setError('Erro ao carregar dados do grupo');
    }
  };

  const loadMembers = async () => {
    if (!activeCommunity) return;
    try {
      const data = await MemberService.listMembers(activeCommunity.id);
      setMembers(data.members);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = {
        ...formData,
        community_id: activeCommunity.id,
        max_members: formData.max_members ? parseInt(formData.max_members.toString()) : 0,
        min_age: formData.min_age ? parseInt(formData.min_age.toString()) : 0,
        max_age: formData.max_age ? parseInt(formData.max_age.toString()) : 0,
        member_count: formData.member_count || 0,
        attendance_count: formData.attendance_count || 0,
        average_attendance: formData.average_attendance || 0,
        meeting_count: formData.meeting_count || 0,
        allow_guests: formData.allow_guests ?? true,
        require_approval: formData.require_approval ?? false,
        track_attendance: formData.track_attendance ?? true,
        allow_self_join: formData.allow_self_join ?? true,
        notify_on_join_request: formData.notify_on_join_request ?? true,
        notify_on_new_member: formData.notify_on_new_member ?? true,
        type: formData.type || GroupType.SMALL_GROUP,
        status: formData.status || GroupStatus.ACTIVE,
        visibility: formData.visibility || GroupVisibility.PUBLIC,
        frequency: formData.frequency || 'weekly',
        tags: formData.tags || [],
        start_date: formData.start_date || new Date().toISOString(),
      };

      console.log('Dados a serem enviados:', formDataToSend);

      if (id) {
        await GroupService.updateGroup(activeCommunity.id, id, formDataToSend);
        setSuccess('Grupo atualizado com sucesso!');
      } else {
        await GroupService.createGroup(activeCommunity.id, formDataToSend);
        setSuccess('Grupo criado com sucesso!');
      }
      navigate('/groups');
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.details || err.response?.data?.message || 'Erro ao salvar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar grupos
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
              onClick={() => navigate('/groups')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              {id ? 'Editar Grupo' : 'Novo Grupo'}
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
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Grupo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
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
                      {Object.entries(GroupTypeLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Categoria"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  />
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
                      {Object.entries(GroupStatusLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Visibilidade</InputLabel>
                    <Select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      label="Visibilidade"
                      required
                    >
                      {Object.entries(GroupVisibilityLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Líder</InputLabel>
                    <Select
                      name="leader_id"
                      value={formData.leader_id || ''}
                      onChange={handleChange}
                      label="Líder"
                    >
                      <MenuItem value="">
                        <em>Selecione um líder</em>
                      </MenuItem>
                      {members.map((member) => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Co-líder</InputLabel>
                    <Select
                      name="co_leader_id"
                      value={formData.co_leader_id || ''}
                      onChange={handleChange}
                      label="Co-líder"
                    >
                      <MenuItem value="">
                        <em>Selecione um co-líder</em>
                      </MenuItem>
                      {members.map((member) => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Local"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dia do Encontro"
                    name="meeting_day"
                    value={formData.meeting_day}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Horário"
                    name="meeting_time"
                    value={formData.meeting_time}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Frequência"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Máximo de Membros"
                    name="max_members"
                    value={formData.max_members}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Idade Mínima"
                    name="min_age"
                    value={formData.min_age}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Idade Máxima"
                    name="max_age"
                    value={formData.max_age}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Gênero</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Gênero"
                    >
                      <MenuItem value="">
                        <em>Todos</em>
                      </MenuItem>
                      <MenuItem value="male">Masculino</MenuItem>
                      <MenuItem value="female">Feminino</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                    <DatePicker
                      label="Data de Início"
                      value={formData.start_date ? dayjs(formData.start_date) : null}
                      onChange={(date) => setFormData(prev => ({ ...prev, start_date: date?.toISOString() }))}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.allow_guests}
                          onChange={(e) => setFormData(prev => ({ ...prev, allow_guests: e.target.checked }))}
                          name="allow_guests"
                        />
                      }
                      label="Permitir Visitantes"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.require_approval}
                          onChange={(e) => setFormData(prev => ({ ...prev, require_approval: e.target.checked }))}
                          name="require_approval"
                        />
                      }
                      label="Requer Aprovação"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.track_attendance}
                          onChange={(e) => setFormData(prev => ({ ...prev, track_attendance: e.target.checked }))}
                          name="track_attendance"
                        />
                      }
                      label="Controlar Presença"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.allow_self_join}
                          onChange={(e) => setFormData(prev => ({ ...prev, allow_self_join: e.target.checked }))}
                          name="allow_self_join"
                        />
                      }
                      label="Permitir Auto-inscrição"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notify_on_join_request}
                          onChange={(e) => setFormData(prev => ({ ...prev, notify_on_join_request: e.target.checked }))}
                          name="notify_on_join_request"
                        />
                      }
                      label="Notificar Solicitações"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notify_on_new_member}
                          onChange={(e) => setFormData(prev => ({ ...prev, notify_on_new_member: e.target.checked }))}
                          name="notify_on_new_member"
                        />
                      }
                      label="Notificar Novos Membros"
                    />
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default GroupForm; 