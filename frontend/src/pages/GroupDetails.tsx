import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { GroupService } from '../services/group';
import { useCommunity } from '../contexts/CommunityContext';
import { Group, GroupTypeLabels, GroupStatusLabels, GroupVisibilityLabels } from '../types/group';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const GroupDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (activeCommunity && id) {
      loadGroup();
    }
  }, [activeCommunity, id]);

  const loadGroup = async () => {
    if (!activeCommunity || !id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await GroupService.getGroup(activeCommunity.id, id);
      setGroup(data.group);
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao carregar grupo');
    } finally {
      setLoading(false);
    }
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para visualizar grupos
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography>Carregando...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>Grupo não encontrado</Alert>
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
              {group.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GroupIcon />}
              onClick={() => navigate(`/groups/${group.id}/members`)}
            >
              Membros
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/groups/${group.id}/edit`)}
            >
              Editar
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Gerais
                </Typography>
                <Typography variant="body1" paragraph>
                  {group.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={GroupTypeLabels[group.type]} color="primary" />
                  <Chip label={GroupStatusLabels[group.status]} 
                    color={group.status === 'active' ? 'success' : 'default'} />
                  <Chip label={GroupVisibilityLabels[group.visibility]} />
                  {group.category && <Chip label={group.category} variant="outlined" />}
                </Box>

                <List>
                  {group.location && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText primary="Local" secondary={group.location} />
                    </ListItem>
                  )}

                  {group.meeting_day && group.meeting_time && (
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Horário dos Encontros" 
                        secondary={`${group.meeting_day} às ${group.meeting_time}`} 
                      />
                    </ListItem>
                  )}

                  {group.frequency && (
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText primary="Frequência" secondary={group.frequency} />
                    </ListItem>
                  )}

                  <ListItem>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Data de Início" 
                      secondary={dayjs(group.start_date).locale('pt-br').format('DD/MM/YYYY')} 
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Configurações
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Máximo de Membros"
                          secondary={group.max_members || 'Sem limite'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Faixa Etária"
                          secondary={`${group.min_age || 0} - ${group.max_age || 'Sem limite'} anos`}
                        />
                      </ListItem>
                      {group.gender && (
                        <ListItem>
                          <ListItemText 
                            primary="Gênero"
                            secondary={group.gender === 'male' ? 'Masculino' : 'Feminino'}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Visitantes Permitidos"
                          secondary={group.allow_guests ? 'Sim' : 'Não'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Requer Aprovação"
                          secondary={group.require_approval ? 'Sim' : 'Não'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Auto-inscrição"
                          secondary={group.allow_self_join ? 'Permitida' : 'Não permitida'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Liderança
                </Typography>
                {(group.leader_id || group.co_leader_id) ? (
                  <List>
                    {group.leader_id && (
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Líder" secondary={group.leader_id} />
                      </ListItem>
                    )}
                    {group.co_leader_id && (
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Co-líder" secondary={group.co_leader_id} />
                      </ListItem>
                    )}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma liderança definida
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Estatísticas
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Membros Ativos" 
                      secondary={group.member_count}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total de Encontros" 
                      secondary={group.meeting_count}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Média de Presença" 
                      secondary={`${Math.round(group.average_attendance || 0 * 100)}%`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default GroupDetails; 