import React, { useState, useEffect, useContext } from "react";
import "./chatItem.css";
// import uuid from "react-uuid";
import { format, isToday, isThisWeek, isYesterday } from "date-fns";
// import { UpdateRightScreen, UpdateMobileView } from "../../App";
import { ToastContainer, toast } from "react-toastify";
import Popup from "reactjs-popup";
import { db } from "../../firebase/firebase";
import { Archive, Block, ExpandMore, Group } from "@mui/icons-material";
import { ClickAwayListener } from "@mui/material";
import { useSelector } from "react-redux";

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
  //   const updateRightScreenChat = useContext(UpdateRightScreen);
  //   const updateMobileView = useContext(UpdateMobileView);
  const currentUser = useSelector(state => state.userAuth.currentUser)
  const [user1, setUser1] = useState({
    dp: "daCYII=",
    uname: "",
    umail: "",
    status: "",
  });
  const [options, setOptions] = useState(false);

  useEffect(() => {
    if (type === "personal") {
      const otherUserId = members[0] === currentUser ? members[1] : members[0];
      db.collection("users")
        .doc(otherUserId)
        .get()
        .then((usr) => setUser1(usr.data()))
        .catch((error) =>
          toast.error("Failed to load user data: " + error.message)
        );
    }
  }, [type, currentUser, members]);

  const getLastTextTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "hh:mm aaa");
    if (isYesterday(date)) return "yesterday";
    if (isThisWeek(date)) return format(date, "eeee");
    return format(date, "dd/MM/yyyy");
  };

  const handleChatClick = (e) => {
    if (blocked) {
      toast.error("Unblock chat to view messages", {
        position: "bottom-left",
        autoClose: 2000,
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
    // updateRightScreenChat(targetUser, type, chatid, e.target);
    // updateMobileView(false);
  };

  const toggleOptions = () => setOptions((prev) => !prev);

  return (
    <div
      className={`chat__item ${
        selectedChat === chatid ? "chat__item__selected" : ""
      }`}
      onClick={handleChatClick}
    >
      <ToastContainer />
      {type === "personal" ? (
        <>
          <Popup
            trigger={
              <img className="chat__dp" src={user1.dp} alt={user1.uname} />
            }
            modal
          >
            {(close) => (
              <img
                className="full__img"
                src={user1.dp}
                onClick={close}
                alt="User"
              />
            )}
          </Popup>
          <div className="chat__details">
            <h2 className="theme__h4">{user1.uname}</h2>
            <h4 className="theme__h5 theme__subfont chat__subtext">
              @{user1.umail ? umailExtractor(user1.umail) : "Loading..."}
            </h4>
            <h4 className="theme__h5 theme__subfont chat__subtext">
              {user1.status}
            </h4>
          </div>
        </>
      ) : (
        <>
          <Popup
            trigger={<img className="chat__dp" src={dp} alt={chatname} />}
            modal
          >
            {(close) => (
              <img className="full__img" src={dp} onClick={close} alt="Group" />
            )}
          </Popup>
          <div className="chat__details">
            <h2 className="theme__h4">{chatname}</h2>
            <h4 className="theme__h5 theme__subfont chat__subtext">
              <Group style={{ marginRight: "5px" }} />
              {members.length}
            </h4>
            <h4 className="theme__h5 theme__subfont chat__subtext">
              {description}
            </h4>
          </div>
        </>
      )}
      <div className="chat__item__options">
        <div className="time theme__subfont">{getLastTextTime(lastTexted)}</div>
        <span className="chat__options__icons">
          {archieved && <Archive className="pin__icon" title="Archived chat" />}
          {blocked && <Block className="block__icon" title="Blocked chat" />}
          <ClickAwayListener onClickAway={() => setOptions(false)}>
            <span onClick={toggleOptions}>
              <ExpandMore className="expand__icon" />
            </span>
          </ClickAwayListener>
          {options && (
            <div className="options theme__input__bg">
              {!blocked && (
                <div
                  onClick={() => {
                    /* archive logic */
                  }}
                  className="option__item"
                >
                  {archieved ? "Unarchive chat" : "Archive chat"}
                </div>
              )}
              <div
                onClick={() => {
                  /* block logic */
                }}
                className="option__item"
              >
                {blocked ? "Unblock chat" : "Block chat"}
              </div>
              {type === "group" && (
                <div
                  onClick={() => {
                    /* exit group logic */
                  }}
                  className="option__item"
                >
                  Exit group
                </div>
              )}
            </div>
          )}
        </span>
      </div>
    </div>
  );
}

export default ChatItem;
