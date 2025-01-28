import { useCallback } from 'react';
import { useDialog } from './useDialog';

export function useConfirm() {
  const { openDialog } = useDialog();

  return useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      openDialog({
        title: 'Confirmação',
        message,
        buttons: [
          {
            text: 'Não',
            onClick: () => resolve(false),
          },
          {
            text: 'Sim',
            onClick: () => resolve(true),
            color: 'primary',
          },
        ],
      });
    });
  }, [openDialog]);
} 