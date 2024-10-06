import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: "",
  isLoggedIn: false,
  isLoading: true,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    },

    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    logOut (state) {
      state.currentUser = null;
      state.isLoading = false;
      state.isLoggedIn = false;
    }
  },
});

export const {setCurrentUser, setLoading, logOut} = userAuthSlice.actions;
export default userAuthSlice.reducer;