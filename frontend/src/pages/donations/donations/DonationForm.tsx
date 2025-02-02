import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { format } from 'date-fns';
import { Campaign } from '../../../types/donation';
import { Member } from '../../../types/member';
import { Family } from '../../../types/family';
import { Group } from '../../../types/group';
import { MemberService } from '../../../services/member';
import { FamilyService } from '../../../services/family';
import { GroupService } from '../../../services/group';

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'pix', label: 'PIX' },
];

type DonorType = 'member' | 'family' | 'group';

interface DonationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  campaigns: Campaign[];
  communityId: string;
  initialData?: any;
}

export default function DonationForm({ open, onClose, onSubmit, campaigns, communityId, initialData }: DonationFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    campaign_id: initialData?.campaign_id || '',
    amount: initialData?.amount || 0,
    payment_method: initialData?.payment_method || '',
    status: initialData?.status || 'pending',
    due_date: initialData?.due_date || format(new Date(), 'yyyy-MM-dd'),
    description: initialData?.description || '',
    donor_type: initialData?.donor_type || 'member' as DonorType,
    donor_id: initialData?.donor_id || '',
  });

  useEffect(() => {
    if (communityId) {
      loadDonorOptions();
    }
  }, [communityId, formData.donor_type]);

  const loadDonorOptions = async () => {
    if (!communityId) return;

    try {
      setLoading(true);
      switch (formData.donor_type) {
        case 'member':
          const { members } = await MemberService.listMembers(communityId);
          setMembers(members || []);
          break;
        case 'family':
          const { families } = await FamilyService.listFamilies(communityId);
          setFamilies(families || []);
          break;
        case 'group':
          const { groups } = await GroupService.listGroups(communityId);
          setGroups(groups || []);
          break;
      }
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDonorChange = async (donorId: string) => {
    setFormData(prev => ({
      ...prev,
      donor_id: donorId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Editar Doação' : 'Nova Doação'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Campanha"
                fullWidth
                value={formData.campaign_id}
                onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
              >
                <MenuItem value="">Doação Avulsa</MenuItem>
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Doador</InputLabel>
                <Select
                  value={formData.donor_type}
                  label="Tipo de Doador"
                  onChange={(e: SelectChangeEvent<string>) => {
                    setFormData({
                      ...formData,
                      donor_type: e.target.value as DonorType,
                      donor_id: '',
                    });
                  }}
                >
                  <MenuItem value="member">Membro</MenuItem>
                  <MenuItem value="family">Família</MenuItem>
                  <MenuItem value="group">Grupo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel>{formData.donor_type === 'member' ? 'Membro' : formData.donor_type === 'family' ? 'Família' : 'Grupo'}</InputLabel>
                <Select
                  value={formData.donor_id}
                  label={formData.donor_type === 'member' ? 'Membro' : formData.donor_type === 'family' ? 'Família' : 'Grupo'}
                  onChange={(e) => handleDonorChange(e.target.value)}
                >
                  {formData.donor_type === 'member' && members.map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                  {formData.donor_type === 'family' && families.map(family => (
                    <MenuItem key={family.id} value={family.id}>
                      {family.name}
                    </MenuItem>
                  ))}
                  {formData.donor_type === 'group' && groups.map(group => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor (R$)"
                fullWidth
                required
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Forma de Pagamento"
                fullWidth
                required
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Vencimento"
                fullWidth
                required
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                required
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 