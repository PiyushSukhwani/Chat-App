import React, { useState, useEffect } from "react";
import "./chatDetails.css";
import Popup from "reactjs-popup";
import { toast } from "react-toastify";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { CameraAlt, Close, Done } from "@mui/icons-material";
import UserItem from "../useritem/UserItem";
import UserListItem from "../userListItem/UserListItem";
import { db } from "../../firebase/firebase";
import upload from "../../firebase/upload";
import { useSelector } from "react-redux";

function ChatDetails({
  updateChatDetailsVisibility,
  updateGroup,
}) {
  const [userArray, setUserArray] = useState([]);
  const [chatName, setChatName] = useState("Loading...");
  const [defDesc, setDefDesc] = useState("Loading...");
  const [description, setDescription] = useState("Loading...");
  const [defChatName, setDefChatName] = useState("");
  const [chatImage, setChatImage] = useState(
    "https://res.cloudinary.com/dpjkblzgf/image/upload/v1624507908/mess_zq9mov.png"
  );
  const rightScreenChat = useSelector(state => state.chat.rightScreenChat)

  const uploadImage = async (files) => {
    if (files[0] && files[0].type.includes("image")) {
      if (files[0].size < 4100000) {
        toast.dark("Uploading image", {
          position: "bottom-left",
          autoClose: 4300,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });

        try {
         const imgUrl = upload(files[0])
          setChatImage(imgUrl);
          await setDoc(
            doc(db, "chats", rightScreenChat[0]),
            { dp: imgUrl },
            { merge: true }
          );
        } catch (error) {
          toast.error("Error uploading image", {
            position: "bottom-left",
            autoClose: 2000,
          });
        }
      } else {
        toast.error("Keep image size below 4Mb", {
          position: "bottom-left",
          autoClose: 2000,
        });
      }
    } else if (files[0]) {
      toast.error("Not an image", {
        position: "bottom-left",
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        if (rightScreenChat[1] === 'group') {
          const unsubscribe = onSnapshot(doc(db, 'chats', rightScreenChat[0]), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setDefChatName(data.chatname);
              setDefDesc(data.description);
              setChatName(data.chatname);
              setChatImage(data.dp);
              setDescription(data.description);
              setUserArray(data.members);
            }
          });

          return () => unsubscribe();
        } else if (rightScreenChat[1] === 'personal') {
          const snapshot = await getDoc(doc(db, 'users', rightScreenChat[0]));
          if (snapshot.exists()) {
            const data = snapshot.data();
            setDefDesc(data.status);
            setChatName(data.uname);
            setDefChatName(data.uname);
            setChatImage(data.dp);
            setDescription(data.status);
          }
        }
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    };

    fetchChatDetails();
  }, [rightScreenChat]);

  const handleChatNameChange = async () => {
    if (chatName.trim() !== defChatName.trim() && chatName.trim().length >= 1) {
      setDefChatName(chatName);
      await setDoc(
        doc(db, "chats", rightScreenChat[0]),
        { chatname: chatName },
        { merge: true }
      );
      toast.dark("Updated Group name", {
        position: "bottom-left",
        autoClose: 1000,
      });
    }
  };

  const handleDescriptionChange = async () => {
    if (
      description.trim() !== defDesc.trim() &&
      description.trim().length >= 1
    ) {
      setDefDesc(description);
      await setDoc(
        doc(db, "chats", rightScreenChat[0]),
        { description: description },
        { merge: true }
      );
      toast.dark("Updated Group Description", {
        position: "bottom-left",
        autoClose: 1000,
      });
    }
  };

  return (
    <div className="chat__info theme__bg theme__font">
      <input
        id="uploadId"
        type="file"
        onChange={(event) => uploadImage(event.target.files)}
      />

      <div className="cd__heading theme__green__bg theme__font sticky__top">
        <span onClick={() => updateChatDetailsVisibility(false)}>
          <Close className="close_icon" />
        </span>
        <h3 className="cd__heading__title">
          {rightScreenChat[1] === "group" ? "Group Info" : "User Info"}
        </h3>
      </div>

      <div className="cd__profile__img">
        <Popup
          trigger={<img className="cm__img" src={chatImage} alt="Chat" />}
          modal
        >
          {(close) => (
            <img
              className="full__img"
              src={chatImage}
              alt="Full view"
              onClick={close}
            />
          )}
        </Popup>
        {rightScreenChat[1] === "group" && (
          <label htmlFor="uploadId">
            <h3 className="chpic theme__h3">
              <CameraAlt className="cam__icon" /> Change Photo
            </h3>
          </label>
        )}
        <div className="chat__specs">
          <h3 className="theme__h3">
            {rightScreenChat[1] === "group" ? "Group name" : "Name"}
          </h3>
          <div className="inp__name">
            <input
              spellCheck="false"
              className="theme__font"
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
            <div className="inp__tick" onClick={handleChatNameChange}>
              <Done />
            </div>
          </div>
        </div>
      </div>

      <div className="cd__profile__info">
        <h3 className="theme__h3">
          {rightScreenChat[1] === "group" ? "Description" : "Status"}
        </h3>
        <div className="inp__name">
          <input
            id="name"
            spellCheck="false"
            className="theme__font"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="inp__tick" onClick={handleDescriptionChange}>
            <Done />
          </div>
        </div>
        {rightScreenChat[1] === "group" && (
          <h3 className="theme__h3 noc">{50 - description.length}</h3>
        )}
      </div>

      {rightScreenChat[1] === "group" && (
        <div className="cd__profile__info">
          <h3 className="theme__h3">Participants</h3>
          <span onClick={() => updateGroup(true)}>
            <UserItem
              uname="Add friend"
              umail="[Enter unique id]"
              dp="https://res.cloudinary.com/dpjkblzgf/image/upload/v1627946505/plussSign_dmhjqd.png"
            />
          </span>
          {userArray.map((user) => (
            <UserListItem key={user} uid={user} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatDetails;
