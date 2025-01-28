import { DialogState, DialogActionTypes, OPEN_DIALOG, CLOSE_DIALOG } from './types';

const initialState: DialogState = {
  open: false,
  props: null,
};

export default function dialogReducer(
  state = initialState,
  action: DialogActionTypes
): DialogState {
  switch (action.type) {
    case OPEN_DIALOG:
      return {
        open: true,
        props: action.payload,
      };
    case CLOSE_DIALOG:
      return {
        ...state,
        open: false,
      };
    default:
      return state;
  }
} 