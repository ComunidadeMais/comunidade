import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Group as GroupIcon, People } from '@mui/icons-material';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  memberCount: number;
  status: string;
}

const MemberGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCommunity } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentCommunity?.id) {
          throw new Error('ID da comunidade não encontrado');
        }

        const response = await api.get(`/communities/${currentCommunity.id}/groups`);
        setGroups(response.data.groups || []);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        setError('Não foi possível carregar os grupos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [currentCommunity]);

  if (loading) {
    return (
      <MemberLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <Container 
        maxWidth={false} 
        sx={{ 
          maxWidth: theme.breakpoints.values.lg,
          m: 0,
          p: 0
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Grupos
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {groups.length > 0 ? (
            groups.map((group) => (
              <Grid item xs={12} md={6} key={group.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{group.name}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <People fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {group.memberCount} membros
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {group.description}
                    </Typography>

                    <Box display="flex" gap={1}>
                      <Chip 
                        label={group.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={group.status}
                        size="small"
                        color={group.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Ver Detalhes
                    </Button>
                    {group.status === 'active' && (
                      <Button size="small" color="primary" variant="contained">
                        Participar
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum grupo encontrado
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </MemberLayout>
  );
};

export default MemberGroups; 