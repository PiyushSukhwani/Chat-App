import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import store from "./store/store";
import Auth from "./screens/authentication/Auth";
import UserProfile from "./components/userProfile/UserProfile";

const App = () => {
  return (
    <Provider store={store}>
      <UserProfile />
      {/* <Auth /> */}
    </Provider>
  );
};

export default App;
