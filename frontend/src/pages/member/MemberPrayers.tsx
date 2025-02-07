import React from 'react';
import { Container, Typography } from '@mui/material';
import MemberLayout from '../../layouts/MemberLayout';

const MemberPrayers: React.FC = () => {
  return (
    <MemberLayout>
      <Container>
        <Typography variant="h4">Pedidos de Oração</Typography>
      </Container>
    </MemberLayout>
  );
};

export default MemberPrayers; 