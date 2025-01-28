export interface DialogButton {
  text: string;
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'error';
}

export interface DialogProps {
  title: string;
  message: string;
  buttons?: DialogButton[];
}

export interface DialogState {
  open: boolean;
  props: DialogProps | null;
}

export const OPEN_DIALOG = 'OPEN_DIALOG';
export const CLOSE_DIALOG = 'CLOSE_DIALOG';

interface OpenDialogAction {
  type: typeof OPEN_DIALOG;
  payload: DialogProps;
}

interface CloseDialogAction {
  type: typeof CLOSE_DIALOG;
}

export type DialogActionTypes = OpenDialogAction | CloseDialogAction; 