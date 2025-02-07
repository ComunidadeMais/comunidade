import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Avatar, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Person, Event, EmojiEvents, Group, AttachMoney, Assignment, School, Church } from '@mui/icons-material';
import { memberDashboardService, MemberDashboardData } from '../../services/member/dashboard';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MemberDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
  const { currentCommunity } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentCommunity?.id) return;
        const data = await memberDashboardService.getMemberDashboard(currentCommunity.id);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentCommunity]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Error loading dashboard data
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={dashboardData.profile.photo}
                  sx={{ width: 80, height: 80 }}
                >
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5">{dashboardData.profile.name}</Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {dashboardData.profile.role}
                  </Typography>
                  <Typography variant="body2">
                    Member since {formatDate(dashboardData.profile.joinDate)}
                  </Typography>
                  <Chip
                    label={`Engagement Score: ${dashboardData.profile.engagementScore}%`}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Events Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Event color="primary" />
                <Typography variant="h6">Upcoming Events</Typography>
              </Box>
              <List>
                {dashboardData.events.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemText
                      primary={event.name}
                      secondary={formatDate(event.date)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents color="primary" />
                <Typography variant="h6">Recent Achievements</Typography>
              </Box>
              <List>
                {dashboardData.achievements.map((achievement) => (
                  <ListItem key={achievement.id}>
                    <ListItemText
                      primary={achievement.name}
                      secondary={achievement.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Groups Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Group color="primary" />
                <Typography variant="h6">My Groups</Typography>
              </Box>
              <List>
                {dashboardData.groups.map((group) => (
                  <ListItem key={group.id}>
                    <ListItemText
                      primary={group.name}
                      secondary={`Role: ${group.role}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Donations Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AttachMoney color="primary" />
                <Typography variant="h6">Recent Donations</Typography>
              </Box>
              <List>
                {dashboardData.donations.map((donation) => (
                  <ListItem key={donation.id}>
                    <ListItemText
                      primary={formatCurrency(donation.amount)}
                      secondary={`${formatDate(donation.date)} - ${donation.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Ministry Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Assignment color="primary" />
                <Typography variant="h6">Ministry Tasks</Typography>
              </Box>
              <List>
                {dashboardData.ministry.tasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemText
                      primary={task.name}
                      secondary={formatDate(task.date)}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Training Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <School color="primary" />
                <Typography variant="h6">Training Progress</Typography>
              </Box>
              <List>
                {dashboardData.ministry.trainings.map((training) => (
                  <ListItem key={training.id}>
                    <ListItemText
                      primary={training.name}
                      secondary={training.status}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Prayer Requests Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Church color="primary" />
                <Typography variant="h6">Prayer Requests</Typography>
              </Box>
              <List>
                {dashboardData.prayers.map((prayer) => (
                  <ListItem key={prayer.id}>
                    <ListItemText
                      primary={prayer.title}
                      secondary={`${formatDate(prayer.date)} - ${prayer.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemberDashboard; 