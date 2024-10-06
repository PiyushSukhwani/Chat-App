import React, { useState, useEffect } from "react";
import "./userListItem.css";
import Popup from "reactjs-popup";
import { db } from "../../firebase/firebase";
import { useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

const UserListItem = ({ uid }) => {
  const [dp, setDp] = useState("");
  const [uname, setUname] = useState("Loading...");
  const [umail, setUmail] = useState("");
  const [status, setStatus] = useState("");
  const currentUser = useSelector(state => state.userAuth.currentUser)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUname(userData.uname);
          setDp(userData.dp);
          setUmail(userData.umail);
          setStatus(userData.status);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    if (uid) {
      fetchUserData();
    }
  }, [uid]);

  return (
    <div className="chat__list__item">
      <Popup
        trigger={<img className="chat__dp dp__zoom" src={dp} alt={uname} />}
        modal
      >
        {(close) => (
          <img className="full__img" src={dp} alt={uname} onClick={close} />
        )}
      </Popup>

      <div className="chat__details">
        <h2
          className="theme__h4"
          style={{ display: "inline-flex", marginRight: "5px" }}
        >
          {uname}
        </h2>
        <h4
          className="theme__h5 theme__subfont chat__subtext"
          style={{ display: "inline-flex" }}
        >
          {umail ? `@${umailExtractor(umail)}` : "Loading ..."}
        </h4>
        <h4 className="theme__h5 theme__subfont chat__subtext">{status}</h4>
      </div>
    </div>
  );
};

export default UserListItem;
