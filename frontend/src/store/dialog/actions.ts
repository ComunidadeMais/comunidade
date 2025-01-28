import { DialogProps, OPEN_DIALOG, CLOSE_DIALOG, DialogActionTypes } from './types';

export const openDialog = (props: DialogProps): DialogActionTypes => ({
  type: OPEN_DIALOG,
  payload: props,
});

export const closeDialog = (): DialogActionTypes => ({
  type: CLOSE_DIALOG,
}); 