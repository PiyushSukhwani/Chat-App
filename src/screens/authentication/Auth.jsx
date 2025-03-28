import { useEffect, useState } from "react";
import "./auth.css";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser, setLoading } from "../../store/userAuthStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PermIdentity } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

const Auth = ({ isLoading, updateLoader, updateAuth }) => {
  const [userCount, setUserCount] = useState([]);
  const dispatch = useDispatch();

  // const { currentUser, isLoading } = useSelector((state) => state.userAuth);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        updateAuth(true);
        dispatch(setCurrentUser(user.uid));
      } else {
        // dispatch(setLoading(true));

        toast.dark("Setting up account", {
          position: "top-left",
          autoClose: 3300,
          hideProgressBar: false,
        });

        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            uname: user.displayName,
            umail: user.email,
            dp: user.photoURL,
            status: "Hey there! I am using WeChat",
            friends: [],
            archived: [0],
            blocked: [0],
            theme: "dark",
          },
          { merge: true }
        );
        updateAuth(true);
        updateLoader(false);
        // dispatch(setCurrentUser(user.uid));
      }
    } catch (e) {
      console.log(e);
    }
    //  finally {
    //   dispatch(isLoading(false))
    // }
  };

  useEffect(() => {
    const fetchUserCount = async () => {
      const userCollection = collection(db, "users");
      try {
        const snapShot = await getDocs(userCollection);
        const data = snapShot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setUserCount(data);
      } catch (error) {
        console.error("Error fetching users.");
      }
    };
    fetchUserCount();
  }, []);

  return (
    <div className="auth theme__bg">
      <ToastContainer
        position="top-left"
        autoClose={3300}
        hideProgressBar={false}
      />

      <div className="wave"></div>
      <img
        className="w__logo"
        src="https://res.cloudinary.com/dpjkblzgf/image/upload/v1625326357/icon1_ggxci6.png"
        alt=""
      />
      <h1 className="theme__h3 font__large">
        <PermIdentity className="usrcount__icon" />{" "}
        {userCount.length ? userCount.length : "--"}
      </h1>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <div className="btn__container">
          <button className="join__btn" onClick={signIn}>
            Sign in
            <img
              className="google__logo"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/1200px-Google_%22G%22_Logo.svg.png"
              alt=""
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
