import { FC, ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  button?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, button }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={600} color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {button && <Box>{button}</Box>}
    </Box>
  );
};

export default PageHeader; 