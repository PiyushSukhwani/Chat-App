import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rightScreenChat: [],
  },
  reducers: {
    updateRightScreenChat(state, action) {
      state.rightScreenChat = action.payload;
    },
    resetRightScreenChat(state) {
      state.rightScreenChat = [];
    },
  },
});

export const { updateRightScreenChat, resetRightScreenChat } = chatSlice.actions;
export default chatSlice.reducer;