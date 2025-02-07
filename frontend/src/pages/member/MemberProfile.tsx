import React from 'react';
import { Container, Typography } from '@mui/material';
import MemberLayout from '../../layouts/MemberLayout';

const MemberProfile: React.FC = () => {
  return (
    <MemberLayout>
      <Container>
        <Typography variant="h4">Meu Perfil</Typography>
      </Container>
    </MemberLayout>
  );
};

export default MemberProfile; 