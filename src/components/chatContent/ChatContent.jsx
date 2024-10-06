import React, { useEffect, useState } from "react";
import "./chatContent.css";
import Popup from "reactjs-popup";
import { format, isToday, isThisWeek, isYesterday } from "date-fns";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const getTimeOnly = (timestamp) => {
  return format(new Date(timestamp), "hh:mm aaa");
};

const getDateOnly = (timestamp) => {
  if (isToday(new Date(timestamp))) return "Today";
  else if (isYesterday(new Date(timestamp))) return "Yesterday";
  else if (isThisWeek(new Date(timestamp)))
    return format(new Date(timestamp), "eeee");
  else return format(new Date(timestamp), "dd/MM/yyyy");
};

function ChatContent({ count, rightScreenChat, user, updateScrollTimeout }) {
  const [chatMessages, setChatMessages] = useState([]);

  const update = async () => {
    const chatDocRef = doc(db, "chats", rightScreenChat[3]);
    const snapshot = await getDoc(chatDocRef);
    setChatMessages(snapshot.data().messages);
    updateScrollTimeout();
  };

  useEffect(() => {
    update();
  }, [rightScreenChat, count]);

  return (
    <div id="chat_content" className="chat__content theme__font">
      {chatMessages.map((ele) =>
        ele.type === "info" ? (
          <div key={ele.mid} className="chat__message theme__bg cm__info shade">
            {ele.content}
            <span className="cm__time">{`${getDateOnly(
              ele.timePosted
            )}, ${getTimeOnly(ele.timePosted)}`}</span>
          </div>
        ) : (
          <div
            key={ele.mid}
            className={
              ele.uid === user.uid
                ? "chat__message theme__bg align_right shade"
                : "chat__message theme__bg shade"
            }
          >
            <span className="cm__name">
              {rightScreenChat[1] === "group" ? ele.from : null}
            </span>
            {ele.img.length ? (
              <Popup
                trigger={
                  <img className="cm__img" src={ele.img} alt="message" />
                }
                modal
              >
                {(close) => (
                  <img
                    className="full__img"
                    src={ele.img}
                    alt="full view"
                    onClick={close}
                  />
                )}
              </Popup>
            ) : null}
            {ele.content}
            <span className="cm__time">{`${getDateOnly(
              ele.timePosted
            )}, ${getTimeOnly(ele.timePosted)}`}</span>
          </div>
        )
      )}
    </div>
  );
}

export default ChatContent;
