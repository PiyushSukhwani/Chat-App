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

    logOut (state) {
      state.currentUser = null;
      state.isLoading = false;
    }
  },
});

export const {setCurrentUser, setLoading, logOut} = userAuthSlice.actions;
export default userAuthSlice.reducer;