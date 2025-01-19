import { FC } from 'react';
import { GridActionsCellItem, GridActionsCellItemProps } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

interface GridActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const getGridActions = ({ onEdit, onDelete }: GridActionsProps): React.ReactElement<GridActionsCellItemProps>[] => {
  const theme = useTheme();

  return [
    <GridActionsCellItem
      icon={<EditIcon />}
      label="Editar"
      onClick={onEdit}
      showInMenu={false}
      sx={{
        color: theme.palette.primary.main,
        '&:hover': {
          color: theme.palette.primary.dark,
        }
      }}
    />,
    <GridActionsCellItem
      icon={<DeleteIcon />}
      label="Excluir"
      onClick={onDelete}
      showInMenu={false}
      sx={{
        color: theme.palette.error.main,
        '&:hover': {
          color: theme.palette.error.dark,
        }
      }}
    />,
  ];
};

export default getGridActions; 