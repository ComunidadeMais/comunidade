import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { CommunityService } from '../../services/community';
import { Community } from '../../types/community';
import { formatCommunityType, formatCommunityStatus, getCommunityTypeColor, getCommunityStatusColor } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUrl';

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    status: 'active' as 'active' | 'inactive' | 'archived',
    type: 'church' as 'church' | 'ministry' | 'organization' | 'other',
    allowPublicEvents: true,
    allowPublicGroups: true,
    allowMemberRegistration: true,
    requireApproval: true,
    allowGuestAttendance: true,
    enableContributions: true,
    enableEvents: true,
    enableGroups: true,
    enableAttendance: true
  });

  const loadCommunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CommunityService.listCommunities();
      setCommunities(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar comunidades');
      console.error('Erro ao carregar comunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setFormData({
      name: community.name,
      slug: community.slug,
      description: community.description,
      logo: community.logo,
      banner: community.banner,
      website: community.website,
      email: community.email,
      phone: community.phone,
      address: community.address,
      city: community.city,
      state: community.state,
      country: community.country,
      zipCode: community.zip_code,
      timezone: community.timezone,
      language: community.language,
      status: community.status,
      type: community.type,
      allowPublicEvents: community.allow_public_events,
      allowPublicGroups: community.allow_public_groups,
      allowMemberRegistration: community.allow_member_registration,
      requireApproval: community.require_approval,
      allowGuestAttendance: community.allow_guest_attendance,
      enableContributions: community.enable_contributions,
      enableEvents: community.enable_events,
      enableGroups: community.enable_groups,
      enableAttendance: community.enable_attendance
    });
  };

  const handleNewCommunity = () => {
    setSelectedCommunity(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo: '',
      banner: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      status: 'active',
      type: 'church',
      allowPublicEvents: true,
      allowPublicGroups: true,
      allowMemberRegistration: true,
      requireApproval: true,
      allowGuestAttendance: true,
      enableContributions: true,
      enableEvents: true,
      enableGroups: true,
      enableAttendance: true
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.target.checked
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const communityData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        logo: formData.logo?.trim() || '',
        banner: formData.banner?.trim() || '',
        website: formData.website?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        country: formData.country?.trim() || '',
        zip_code: formData.zipCode?.trim() || '',
        timezone: formData.timezone,
        language: formData.language,
        status: formData.status,
        type: formData.type,
        allow_public_events: formData.allowPublicEvents,
        allow_public_groups: formData.allowPublicGroups,
        allow_member_registration: formData.allowMemberRegistration,
        require_approval: formData.requireApproval,
        allow_guest_attendance: formData.allowGuestAttendance,
        enable_contributions: formData.enableContributions,
        enable_events: formData.enableEvents,
        enable_groups: formData.enableGroups,
        enable_attendance: formData.enableAttendance
      };

      console.log('Estado do formulário antes do envio:', formData);
      console.log('Dados formatados para envio:', communityData);

      let savedCommunity: Community;
      if (selectedCommunity) {
        console.log('Atualizando comunidade:', selectedCommunity.id);
        console.log('Dados atuais da comunidade:', selectedCommunity);
        savedCommunity = await CommunityService.updateCommunity(selectedCommunity.id, communityData);
        console.log('Resposta da atualização:', savedCommunity);
        
        // Verifica se todos os campos foram salvos corretamente
        const notSavedFields = Object.entries(communityData).filter(([key, value]) => {
          // Ignora campos vazios no formulário
          if (!value) return false;
          // Verifica se o campo foi salvo corretamente
          const savedValue = savedCommunity[key as keyof Community];
          return savedValue !== value;
        });

        if (notSavedFields.length > 0) {
          const fields = notSavedFields.map(([key]) => key.replace(/_/g, ' ')).join(', ');
          setError(`Alguns campos não foram salvos corretamente: ${fields}. Por favor, verifique com o administrador do sistema.`);
        } else {
          setSuccess('Comunidade atualizada com sucesso!');
        }

        // Atualiza o estado local com os dados retornados
        setSelectedCommunity(savedCommunity);
        setFormData({
          name: savedCommunity.name,
          slug: savedCommunity.slug,
          description: savedCommunity.description,
          logo: savedCommunity.logo || '',
          banner: savedCommunity.banner || '',
          website: savedCommunity.website || '',
          email: savedCommunity.email || '',
          phone: savedCommunity.phone || '',
          address: savedCommunity.address || '',
          city: savedCommunity.city || '',
          state: savedCommunity.state || '',
          country: savedCommunity.country || '',
          zipCode: savedCommunity.zip_code || '',
          timezone: savedCommunity.timezone,
          language: savedCommunity.language,
          status: savedCommunity.status,
          type: savedCommunity.type,
          allowPublicEvents: savedCommunity.allow_public_events,
          allowPublicGroups: savedCommunity.allow_public_groups,
          allowMemberRegistration: savedCommunity.allow_member_registration,
          requireApproval: savedCommunity.require_approval,
          allowGuestAttendance: savedCommunity.allow_guest_attendance,
          enableContributions: savedCommunity.enable_contributions,
          enableEvents: savedCommunity.enable_events,
          enableGroups: savedCommunity.enable_groups,
          enableAttendance: savedCommunity.enable_attendance
        });
      } else {
        console.log('Criando nova comunidade');
        savedCommunity = await CommunityService.createCommunity(communityData);
        console.log('Resposta da criação:', savedCommunity);
        
        // Atualiza o estado local com os dados retornados
        setSelectedCommunity(savedCommunity);
        setFormData({
          name: savedCommunity.name,
          slug: savedCommunity.slug,
          description: savedCommunity.description,
          logo: savedCommunity.logo || '',
          banner: savedCommunity.banner || '',
          website: savedCommunity.website || '',
          email: savedCommunity.email || '',
          phone: savedCommunity.phone || '',
          address: savedCommunity.address || '',
          city: savedCommunity.city || '',
          state: savedCommunity.state || '',
          country: savedCommunity.country || '',
          zipCode: savedCommunity.zip_code || '',
          timezone: savedCommunity.timezone,
          language: savedCommunity.language,
          status: savedCommunity.status,
          type: savedCommunity.type,
          allowPublicEvents: savedCommunity.allow_public_events,
          allowPublicGroups: savedCommunity.allow_public_groups,
          allowMemberRegistration: savedCommunity.allow_member_registration,
          requireApproval: savedCommunity.require_approval,
          allowGuestAttendance: savedCommunity.allow_guest_attendance,
          enableContributions: savedCommunity.enable_contributions,
          enableEvents: savedCommunity.enable_events,
          enableGroups: savedCommunity.enable_groups,
          enableAttendance: savedCommunity.enable_attendance
        });
        
        setSuccess('Comunidade criada com sucesso!');
      }
      
      // Atualiza a lista de comunidades
      await loadCommunities();
    } catch (err: any) {
      console.error('Erro detalhado:', err);
      console.error('Resposta da API:', err.response);
      setError(err.response?.data?.message || 'Erro ao salvar comunidade');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta comunidade?')) {
      setLoading(true);
      setError(null);
      try {
        await CommunityService.deleteCommunity(id);
        setSuccess('Comunidade excluída com sucesso!');
        loadCommunities();
        if (selectedCommunity?.id === id) {
          handleNewCommunity();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao excluir comunidade');
        console.error('Erro ao excluir comunidade:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files[0] && selectedCommunity) {
      setLoading(true);
      setError(null);
      try {
        const file = e.target.files[0];
        let filepath = '';

        if (type === 'logo') {
          filepath = await CommunityService.uploadLogo(selectedCommunity.id, file);
          setFormData(prev => ({ ...prev, logo: filepath }));
        } else {
          filepath = await CommunityService.uploadBanner(selectedCommunity.id, file);
          setFormData(prev => ({ ...prev, banner: filepath }));
        }

        setSuccess(`${type === 'logo' ? 'Logo' : 'Banner'} atualizado com sucesso!`);
        
        // Atualiza a lista de comunidades
        await loadCommunities();
      } catch (err: any) {
        console.error('Erro ao fazer upload:', err);
        setError(err.response?.data?.message || `Erro ao fazer upload do ${type}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Comunidades
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewCommunity}
            disabled={loading}
          >
            Nova Comunidade
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Lista de Comunidades */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Minhas Comunidades
                </Typography>
                {loading && !communities.length ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {communities.map((community) => (
                      <Box
                        key={community.id}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: selectedCommunity?.id === community.id ? 'action.selected' : 'transparent',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onClick={() => handleSelectCommunity(community)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={getImageUrl(community.logo)}
                            alt={community.name}
                            sx={{ width: 40, height: 40 }}
                          >
                            {community.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">{community.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: getCommunityTypeColor(community.type)
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatCommunityType(community.type)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: getCommunityStatusColor(community.status) }}>
                                • {formatCommunityStatus(community.status)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(community.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Formulário */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Cabeçalho com Logo */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={getImageUrl(formData.logo)}
                          alt={formData.name}
                          sx={{ 
                            width: 120, 
                            height: 120,
                            border: '2px solid',
                            borderColor: 'primary.main'
                          }}
                        >
                          {formData.name.charAt(0)}
                        </Avatar>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="logo-upload"
                          type="file"
                          onChange={(e) => handleFileChange(e, 'logo')}
                          disabled={!selectedCommunity || loading}
                        />
                        <label htmlFor="logo-upload">
                          <IconButton
                            color="primary"
                            aria-label="upload logo"
                            component="span"
                            disabled={!selectedCommunity || loading}
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              bgcolor: 'background.paper'
                            }}
                          >
                            <PhotoCameraIcon />
                          </IconButton>
                        </label>
                      </Box>
                    </Grid>

                    {/* Banner */}
                    <Grid item xs={12}>
                      <Box sx={{ position: 'relative', width: '100%', height: 200, borderRadius: 2, overflow: 'hidden' }}>
                        {formData.banner ? (
                          <Box
                            component="img"
                            src={getImageUrl(formData.banner)}
                            alt="Banner"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography color="text.secondary">
                              Nenhum banner selecionado
                            </Typography>
                          </Box>
                        )}
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="banner-upload"
                          type="file"
                          onChange={(e) => handleFileChange(e, 'banner')}
                          disabled={!selectedCommunity || loading}
                        />
                        <label htmlFor="banner-upload">
                          <IconButton
                            color="primary"
                            aria-label="upload banner"
                            component="span"
                            disabled={!selectedCommunity || loading}
                            sx={{
                              position: 'absolute',
                              bottom: 16,
                              right: 16,
                              bgcolor: 'background.paper'
                            }}
                          >
                            <PhotoCameraIcon />
                          </IconButton>
                        </label>
                      </Box>
                    </Grid>

                    {/* Informações Básicas */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Informações Básicas
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nome"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Slug"
                        name="slug"
                        value={formData.slug}
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

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          name="type"
                          value={formData.type}
                          onChange={handleSelectChange}
                          label="Tipo"
                        >
                          <MenuItem value="church">Igreja</MenuItem>
                          <MenuItem value="ministry">Ministério</MenuItem>
                          <MenuItem value="organization">Organização</MenuItem>
                          <MenuItem value="other">Outro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleSelectChange}
                          label="Status"
                        >
                          <MenuItem value="active">Ativo</MenuItem>
                          <MenuItem value="inactive">Inativo</MenuItem>
                          <MenuItem value="archived">Arquivado</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Contato */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Contato
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Grid>

                    {/* Endereço */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Endereço
                      </Typography>
                    </Grid>

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

                    {/* Configurações */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Configurações
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Idioma</InputLabel>
                        <Select
                          name="language"
                          value={formData.language}
                          onChange={handleSelectChange}
                          label="Idioma"
                        >
                          <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Español</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Fuso Horário</InputLabel>
                        <Select
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleSelectChange}
                          label="Fuso Horário"
                        >
                          <MenuItem value="America/Sao_Paulo">América/São Paulo</MenuItem>
                          {/* Adicionar mais fusos horários conforme necessário */}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Permissões */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Permissões
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.allowPublicEvents}
                            onChange={handleSwitchChange('allowPublicEvents')}
                            name="allowPublicEvents"
                          />
                        }
                        label="Permitir eventos públicos"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.allowPublicGroups}
                            onChange={handleSwitchChange('allowPublicGroups')}
                            name="allowPublicGroups"
                          />
                        }
                        label="Permitir grupos públicos"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.allowMemberRegistration}
                            onChange={handleSwitchChange('allowMemberRegistration')}
                            name="allowMemberRegistration"
                          />
                        }
                        label="Permitir registro de membros"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.requireApproval}
                            onChange={handleSwitchChange('requireApproval')}
                            name="requireApproval"
                          />
                        }
                        label="Requer aprovação"
                      />
                    </Grid>

                    {/* Recursos */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Recursos
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enableContributions}
                            onChange={handleSwitchChange('enableContributions')}
                            name="enableContributions"
                          />
                        }
                        label="Habilitar contribuições"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enableEvents}
                            onChange={handleSwitchChange('enableEvents')}
                            name="enableEvents"
                          />
                        }
                        label="Habilitar eventos"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enableGroups}
                            onChange={handleSwitchChange('enableGroups')}
                            name="enableGroups"
                          />
                        }
                        label="Habilitar grupos"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enableAttendance}
                            onChange={handleSwitchChange('enableAttendance')}
                            name="enableAttendance"
                          />
                        }
                        label="Habilitar controle de presença"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        startIcon={<SaveIcon />}
                      >
                        {loading ? 'Salvando...' : 'Salvar alterações'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Communities; 