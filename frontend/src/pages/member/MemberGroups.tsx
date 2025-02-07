import React from 'react';
import { Container, Typography } from '@mui/material';
import MemberLayout from '../../layouts/MemberLayout';

const MemberGroups: React.FC = () => {
  return (
    <MemberLayout>
      <Container>
        <Typography variant="h4">Grupos</Typography>
      </Container>
    </MemberLayout>
  );
};

export default MemberGroups; 