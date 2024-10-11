import React, { useState, useEffect, useContext } from "react";
import "./chatItem.css";
import { ToastContainer, toast } from "react-toastify";
import Popup from "reactjs-popup";
import { db } from "../../firebase/firebase";
import { Archive, Block, ExpandMore, Group } from "@mui/icons-material";
import { ClickAwayListener } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import {
  resetRightScreenChat,
  updateRightScreenChat,
} from "../../store/chatSlice";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { updateMobileView } from "../../App";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

function ChatItem({
  uid,
  selectedChat,
  changeSelectedChat,
  umail,
  chatid,
  chatname,
  dp,
  type,
  members,
  description,
  lastTexted,
  archieved = false,
  blocked = false,
}) {
  const currentUser = useSelector((state) => state.userAuth.currentUser);
  const [user1, setUser1] = useState({
    dp: "",
    uname: "",
    umail: "",
    status: "",
  });
  const [options, setOptions] = useState(false);
  const [display, setDisplay] = useState(true);
  const dispatch = useDispatch();
  const updateMobileViewLeft = useContext(updateMobileView);

  useEffect(() => {
    const fetchUserData = async () => {
      if (type === "personal") {
        const otherUserId =
          members[0] === currentUser ? members[1] : members[0];

        try {
          const userRef = doc(db, "users", otherUserId);
          const usr = await getDoc(userRef);

          if (usr.exists()) {
            const data = usr.data();
            setUser1(data);
          } else {
            toast.error("User not found.");
          }
        } catch (error) {
          toast.error("Failed to load user data: " + error.message);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const exitGroup = async () => {
    setDisplay(false);
    if (selectedChat === chatid) dispatch(resetRightScreenChat());
    setTimeout(async () => {
      const chatRef = doc(db, "chats", chatid);

      try {
        await updateDoc(chatRef, {
          members: arrayRemove(uid),
          membersMail: arrayRemove(umail),
        });

        await setDoc(
          chatRef,
          {
            messages: arrayUnion({
              mid: uuid(),
              content: `${umailExtractor(umail)} left the group :(`,
              timePosted: `${new Date()}`,
              type: "info",
            }),
            lastTexted: `${new Date()}`,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating chat:", error);
      }
    }, 5000);
  };

  const archieveItemHandler = async () => {
    const userRef = doc(db, "users", uid);
    setDisplay(false);

    try {
      if (archieved) {
        await updateDoc(userRef, {
          archived: arrayRemove(chatid),
        });
      } else {
        await updateDoc(userRef, {
          archived: arrayUnion(chatid),
        });
      }
    } catch (error) {
      console.error("Error updating archived items:", error);
    }
  };

  const blockItemHandler = async () => {
    const userRef = doc(db, "users", uid);
    setDisplay(false);

    try {
      if (blocked) {
        await updateDoc(userRef, {
          blocked: arrayRemove(chatid),
        });
      } else {
        if (chatid === selectedChat) {
          dispatch(resetRightScreenChat());
        }

        await updateDoc(userRef, {
          blocked: arrayUnion(chatid),
        });
      }
    } catch (error) {
      console.error("Error updating blocked items:", error);
    }
  };

  const getLastTextTime = (timestamp) => {
    let date;

    if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
      const milliseconds =
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
      date = dayjs(milliseconds);
    } else if (typeof timestamp === "string") {
      date = dayjs(timestamp);
    } else {
      console.error("Invalid timestamp format:", timestamp);
      return "Invalid Date";
    }

    if (!date.isValid()) {
      console.error("Invalid date created from timestamp:", timestamp);
      return "Invalid Date";
    }

    if (date.isToday()) return date.format("hh:mm a");
    if (date.isYesterday()) return "yesterday";
    if (date.isSameOrAfter(dayjs().subtract(7, "day")))
      return date.format("dddd");
    return date.format("DD/MM/YYYY");
  };

  const handleChatClick = (e) => {
    if (blocked) {
      toast.error("Unblock chat to view messages", {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
      return;
    }
    changeSelectedChat(chatid);

    const targetUser =
      type === "personal"
        ? currentUser === members[0]
          ? members[1]
          : members[0]
        : chatid;
    dispatch(updateRightScreenChat([targetUser, type, chatid, e.target.id]));
    updateMobileViewLeft(false);
  };

  const toggleOptions = () => setOptions((prev) => !prev);

  return (
    <div style={{ display: display ? "block" : "none", position: "relative" }}>
      <ToastContainer />
      <div
        className="chat__item"
        id={chatid}
        onClick={(e) => handleChatClick(e)}
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          cursor: "pointer",
        }}
      ></div>

      {type === "personal" ? (
        <div
          className={
            selectedChat === chatid
              ? "chat__item chat__item__selected"
              : "chat__item"
          }
        >
          <button
            style={{
              position: "relative",
              zIndex: "2",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              width: "fit-content",
            }}
          >
            <Popup
              trigger={
                <img className="chat__dp" src={user1.dp} alt="User Profile" />
              }
              modal
            >
              {(close) => (
                <img
                  className="full__img"
                  src={user1.dp}
                  alt="Full View"
                  onClick={close}
                />
              )}
            </Popup>
          </button>

          <div className="chat__details">
            <h2
              style={{ display: "inline-flex", marginRight: "5px" }}
              className="theme__h4"
            >
              {user1.uname}
            </h2>
            <h4
              style={{ display: "inline-flex" }}
              className="theme__h5 theme__subfont chat__subtext"
            >
              {user1.umail ? `@${umailExtractor(user1.umail)}` : "Loading ..."}
            </h4>
            <h4 className="theme__h5 theme__subfont chat__subtext">
              {user1.status}
            </h4>
          </div>

          <div className="chat__item__options">
            <div className="time theme__subfont">
              {getLastTextTime(lastTexted)}
            </div>
            <span className="chat__options__icons">
              {archieved && (
                <span title="Archived chat">
                  <Archive className="pin__icon" />
                </span>
              )}
              {blocked && (
                <span title="Blocked chat">
                  <Block className="block__icon" />
                </span>
              )}

              <ClickAwayListener onClickAway={() => setOptions(false)}>
                <span onClick={toggleOptions}>
                  <ExpandMore className="expand__icon" />
                </span>
              </ClickAwayListener>

              {options && (
                <div
                  style={{ position: "absolute", border: "1px solid grey" }}
                  className="options theme__input__bg"
                  onClick={() => setOptions(false)}
                >
                  {!blocked && (
                    <div onClick={archieveItemHandler} className="option__item">
                      {archieved ? "Unarchive chat" : "Archive chat"}
                    </div>
                  )}
                  <div onClick={blockItemHandler} className="option__item">
                    {blocked ? "Unblock chat" : "Block chat"}
                  </div>
                </div>
              )}
            </span>
          </div>
        </div>
      ) : (
        <div
          className={
            selectedChat === chatid
              ? "chat__item chat__item__selected"
              : "chat__item"
          }
        >
          <button
            style={{
              position: "relative",
              zIndex: "2",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              width: "fit-content",
            }}
          >
            <Popup
              trigger={
                <img className="chat__dp" src={dp} alt="Group Profile" />
              }
              modal
            >
              {(close) => (
                <img
                  className="full__img"
                  src={dp}
                  alt="Full View"
                  onClick={close}
                />
              )}
            </Popup>
          </button>

          <div className="chat__details">
            <div style={{ display: "flex", alignItems: "center" }}>
              <h2 style={{ marginRight: "10px" }} className="theme__h4">
                {chatname}
              </h2>
              <h4
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
                className="theme__h5 theme__subfont chat__subtext"
              >
                <Group style={{ marginRight: "5px" }} />
                {members.length}
              </h4>
            </div>
            <h4 className="theme__h5 theme__subfont chat__subtext">
              {description}
            </h4>
          </div>

          <div className="chat__item__options">
            <div className="time theme__subfont">
              {getLastTextTime(lastTexted)}
            </div>
            <span className="chat__options__icons">
              {archieved && (
                <span title="Archived chat">
                  <Archive className="pin__icon" />
                </span>
              )}
              {blocked && (
                <span title="Blocked chat">
                  <Block className="block__icon" />
                </span>
              )}

              <ClickAwayListener onClickAway={() => setOptions(false)}>
                <span onClick={toggleOptions}>
                  <ExpandMore className="expand__icon" />
                </span>
              </ClickAwayListener>

              {options && (
                <div
                  style={{ position: "absolute", border: "1px solid grey" }}
                  className="options theme__input__bg"
                  onClick={() => setOptions(false)}
                >
                  {!blocked && (
                    <div onClick={archieveItemHandler} className="option__item">
                      {archieved ? "Unarchive chat" : "Archive chat"}
                    </div>
                  )}
                  <div onClick={blockItemHandler} className="option__item">
                    {blocked ? "Unblock chat" : "Block chat"}
                  </div>
                  {!blocked && (
                    <div onClick={exitGroup} className="option__item">
                      Exit group
                    </div>
                  )}
                </div>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatItem;
