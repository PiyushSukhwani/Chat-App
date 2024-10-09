import React, { createContext, useEffect, useState } from "react";
import "./App.css";
import { useDispatch } from "react-redux";
import Auth from "./screens/authentication/Auth";
import LeftScreen from "./screens/leftScreen/LeftScreen";
import RightScreen from "./screens/rightScreen/RightScreen";
import { setCurrentUser } from "./store/userAuthStore";
import { auth, db, onAuthStateChanged } from "./firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const updateMobileView = createContext();
export const updateTheme = createContext();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [mobileViewLeft, setMobileViewLeft] = useState(true);
  const [userUid, setUserUid] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const dispatch = useDispatch();

  const updateLoader = (option) => setIsLoading(option);

  const updateAuth = (status) => setIsLoggedIn(status);

  const updateAppTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (userUid) {
      await setDoc(
        doc(db, "users", userUid),
        { theme: newTheme },
        { merge: true }
      );
    }
  };

  const cssPropertiesLight = {
    "--darkInputBackground": "rgb(238, 231, 231)",
    "--darkBackground": "rgb(238, 231, 231)",
    "--darkGreenBackground": "#3fdbb7",
    "--darkFontColor": "rgb(43, 42, 42)",
    "--darkFontSHColor": "grey",
    "--darkChatBG": "#fee4c3cc",
  };

  const cssPropertiesDark = {
    "--darkInputBackground": "#343836",
    "--darkBackground": "rgb(27, 39, 39)",
    "--darkGreenBackground": "#343836",
    "--darkFontColor": "#fff",
    "--darkFontSHColor": "rgb(153, 151, 151)",
    "--darkChatBG": "rgba(27, 26, 26, 0.89)",
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // updateLoader(true);
      if (user) {
        dispatch(setCurrentUser(user.uid));
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserUid(userDoc.data().uid);
            setTheme(userDoc.data().theme);
          } else {
            console.log("No user document found");
          }
        } catch (error) {
          console.error("Error fetching user document: ", error);
        }
      } else {
        dispatch(setCurrentUser(null));
      }
      updateLoader(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  return (
    <updateTheme.Provider value={updateAppTheme}>
      <updateMobileView.Provider value={setMobileViewLeft}>
        <>
          <div
            className="app"
            style={theme === "light" ? cssPropertiesLight : cssPropertiesDark}
          >
            {isLoggedIn ? (
              <div className="screen">
                {mobileViewLeft ? (
                  <>
                    <div
                      className={
                        screenWidth < 600 ? "app__left app__full" : "app__left"
                      }
                    >
                      <LeftScreen />
                    </div>
                    <div
                      className={
                        screenWidth < 600
                          ? "app__right app__none"
                          : "app__right"
                      }
                    >
                      <RightScreen />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={
                        screenWidth < 600 ? "app__left app__none" : "app__left"
                      }
                    >
                      <LeftScreen />
                    </div>
                    <div
                      className={
                        screenWidth < 600
                          ? "app__right app__full"
                          : "app__right"
                      }
                    >
                      <RightScreen />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Auth
                isLoading={isLoading}
                updateLoader={updateLoader}
                updateAuth={updateAuth}
              />
            )}
          </div>
        </>
      </updateMobileView.Provider>
    </updateTheme.Provider>
  );
};

export default App;
