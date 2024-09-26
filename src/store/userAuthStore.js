import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: 'i37CICtnhPcVhXaMUibPRwLmmYn2',
  isLoading: true,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
      console.log(state.currentUser, state.isLoading);
    },

    setLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
});

export const {setCurrentUser, setLoading} = userAuthSlice.actions;
export default userAuthSlice.reducer;