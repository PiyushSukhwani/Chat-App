import { configureStore } from "@reduxjs/toolkit";
import userAuthStore from "./userAuthStore";
import chatSlice from "./chatSlice"

const store = configureStore({
  reducer: {
    userAuth: userAuthStore,
    chat: chatSlice,
  },
});

export default store;
