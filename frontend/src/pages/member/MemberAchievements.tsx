import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import engagementService, { Achievement } from '../../services/member/engagement';

const MemberAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCommunity, currentUser } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadAchievements();
  }, [currentCommunity]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentCommunity?.id || !currentUser?.id) {
        throw new Error('ID da comunidade ou membro não encontrado');
      }

      const response = await engagementService.listAchievements(currentCommunity.id, currentUser.id);
      setAchievements(response.achievements || []);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      setError('Não foi possível carregar as conquistas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  };

  const getNextLevelPoints = () => {
    const currentPoints = getTotalPoints();
    const levels = [100, 250, 500, 1000, 2000, 5000];
    return levels.find(level => level > currentPoints) || levels[levels.length - 1];
  };

  if (loading) {
    return (
      <MemberLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
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
            Minhas Conquistas
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resumo de pontos */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total de Pontos
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {getTotalPoints()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Conquistas
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {achievements.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Próximo Nível
                  </Typography>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {getTotalPoints()} / {getNextLevelPoints()} pontos
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(getTotalPoints() / getNextLevelPoints()) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de conquistas */}
        <Grid container spacing={3}>
          {achievements.map((achievement) => (
            <Grid item xs={12} md={4} key={achievement.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <TrophyIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">
                        {achievement.badgeName}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <StarIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {achievement.points} pontos
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {achievement.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Conquistado em {format(new Date(achievement.earnedAt), "PPp", { locale: ptBR })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </MemberLayout>
  );
};

export default MemberAchievements; 