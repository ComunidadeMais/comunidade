import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openDialog as openDialogAction } from '../store/dialog/actions';
import { DialogProps } from '../store/dialog/types';

export function useDialog() {
  const dispatch = useDispatch();

  const openDialog = useCallback((props: DialogProps) => {
    dispatch(openDialogAction(props));
  }, [dispatch]);

  return { openDialog };
} 