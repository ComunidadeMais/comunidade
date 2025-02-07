import React from 'react';
import { Container, Typography } from '@mui/material';
import MemberLayout from '../../layouts/MemberLayout';

const MemberDonations: React.FC = () => {
  return (
    <MemberLayout>
      <Container>
        <Typography variant="h4">Doações</Typography>
      </Container>
    </MemberLayout>
  );
};

export default MemberDonations; 