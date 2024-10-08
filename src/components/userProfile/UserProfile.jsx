import React, { useState, useEffect, useContext } from "react";
import "./userProfile.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { ArrowBack, CameraAlt , Edit, Done} from "@mui/icons-material";
import upload from "../../firebase/upload";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

const UserProfile = ({ change }) => {
    const {currentUser, isLoading} = useSelector((state) => state.userAuth);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState({
    uname: "",
    status: "",
    dp: "",
    uid: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser));
        if (userDoc.exists()) {
          setUser(userDoc.data());
          setUsername(userDoc.data().uname);
          setStatus(userDoc.data().status);
        }
      }
    }
    fetchUserData();
  }, [currentUser]);

  const uploadImage = async (files) => {
    if (files[0] && files[0].type.includes("image")) {
      if (files[0].size < 5,242,900) {
        toast.dark("Uploading image", {
          position: "bottom-left",
          autoClose: 4300,
          hideProgressBar: false,
        });

        try {
          const newDp = await upload(files[0]);
          setUser((prev) => ({ ...prev, dp: newDp }));
          await setDoc(doc(db, "users", user.uid), { dp: newDp }, { merge: true });
        } catch (error) {
          toast.error("Error uploading image", {
            position: "bottom-left",
            autoClose: 2000,
          });
        }
      } else {
        toast.error("Keep image size below 5MB", {
          position: "bottom-left",
          autoClose: 2000,
        });
      }
    } else {
      toast.error("Not an image", {
        position: "bottom-left",
        autoClose: 2000,
      });
    }
  };

  const updateUserProfile = async (field, value) => {
    if (value.trim() === "") return;

    try {
      await setDoc(doc(db, "users", user.uid), { [field]: value.trim() }, { merge: true });
      setUser((prev) => ({ ...prev, [field]: value }));
      toast.dark(`${field.charAt(0).toUpperCase() + field.slice(1)} changed successfully`, {
        position: "bottom-left",
        autoClose: 1000,
      });
    } catch (error) {
      toast.error(`Error updating ${field}`, {
        position: "bottom-left",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="user__profile theme__bg theme__font">
      <div className="profile__header sticky__top theme__green__bg">
        <span onClick={() => change("chatList")}>
          <ArrowBack className="profile__back" />
        </span>
        <h2 className="theme__h2">Profile</h2>
      </div>

      <div className="profile__content">
        <div className="profile__image">
          <Popup trigger={<img className="cm__img" src={user.dp} alt="Profile" />} modal>
            {(close) => <img className="full__img" src={user.dp} alt="Profile" onClick={close} />}
          </Popup>

          <input
            id="uploadId"
            type="file"
            onChange={(event) => uploadImage(event.target.files)}
          />
          <ToastContainer position="bottom-left" autoClose={2500} hideProgressBar={false} />
          <label htmlFor="uploadId">
            <h3 className="chpic theme__h3">
              <CameraAlt className="cam__icon" /> Change Photo
            </h3>
          </label>
        </div>

        <h3 className="theme__h3 edit__head">
          Your Name <label htmlFor="name"><Edit className="edit__pen" /></label>
        </h3>
        <div className="inp__name">
          <input
            id="name"
            spellCheck="false"
            className="theme__font"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {username.trim() !== user.uname && username.length >= 3 && (
            <div className="inp__tick" onClick={() => updateUserProfile("uname", username)}>
              <Done />
            </div>
          )}
        </div>

        <h3 className="about__prof theme__h3 edit__head">
          About <label htmlFor="about"><Edit className="edit__pen" /></label>
        </h3>
        <div className="inp__status">
          <textarea
            id="about"
            maxLength="50"
            spellCheck="false"
            className="status__inp theme__font"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          {status.trim() !== user.status && (
            <div className="inp__tick" onClick={() => updateUserProfile("status", status)}>
              <Done />
            </div>
          )}
        </div>
        <h3 className="theme__h3 noc">{50 - status.length}</h3>

        <h3 className="theme__h3">Your Unique ID</h3>
        <p className="font__small theme__subfont">(Your friends can add you with this Unique ID)</p>
        <div className="inp__name">
          <h3 className="theme__font font__medium">{user.umail && umailExtractor(user.umail)}</h3>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
