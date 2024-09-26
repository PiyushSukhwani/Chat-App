import { configureStore } from "@reduxjs/toolkit";
import userAuthStore from "./userAuthStore";

const store = configureStore({
  reducer: {
    userAuth: userAuthStore,
  },
});

export default store;
