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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { FamilyService } from '../services/family';
import { MemberService } from '../services/member';
import { useCommunity } from '../contexts/CommunityContext';
import { Member } from '../types/member';

const FamilyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    community_id: '',
    name: '',
    description: '',
    head_of_family: '',
  });

  useEffect(() => {
    if (activeCommunity) {
      setFormData(prev => ({
        ...prev,
        community_id: activeCommunity.id
      }));
      loadMembers();
      if (id) {
        loadFamily();
      }
    }
  }, [activeCommunity, id]);

  const loadFamily = async () => {
    if (!activeCommunity || !id) return;

    try {
      const response = await FamilyService.getFamily(activeCommunity.id, id);
      const family = response.family || response;
      setFormData({
        community_id: family.community_id,
        name: family.name,
        description: family.description || '',
        head_of_family: family.head_of_family || '',
      });
    } catch (err: any) {
      console.error('Erro ao carregar família:', err);
      setError('Erro ao carregar dados da família');
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
      if (id) {
        await FamilyService.updateFamily(activeCommunity.id, id, formData);
        setSuccess('Família atualizada com sucesso!');
      } else {
        await FamilyService.createFamily(activeCommunity.id, formData);
        setSuccess('Família criada com sucesso!');
      }
      navigate('/families');
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.details || err.response?.data?.message || 'Erro ao salvar família');
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

    if (name === 'head_of_family' && value) {
      const selectedMember = members.find(m => m.id === value);
      if (selectedMember && !formData.name) {
        const lastName = FamilyService.getLastName(selectedMember.name);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          name: `Família ${lastName}`
        }));
      }
    }
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar famílias
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
              onClick={() => navigate('/families')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              {id ? 'Editar Família' : 'Nova Família'}
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
                  <FormControl fullWidth>
                    <InputLabel id="head-of-family-label">Chefe da Família</InputLabel>
                    <Select
                      labelId="head-of-family-label"
                      id="head-of-family"
                      name="head_of_family"
                      value={formData.head_of_family}
                      onChange={handleChange}
                      label="Chefe da Família"
                    >
                      <MenuItem value="">
                        <em>Nenhum</em>
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
                    label="Nome da Família"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    helperText="Ex: Família Silva"
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
                    helperText="Adicione informações adicionais sobre a família"
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default FamilyForm; 