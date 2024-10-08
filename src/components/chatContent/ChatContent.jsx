import React, { useEffect, useState } from "react";
import "./chatContent.css";
import Popup from "reactjs-popup";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

const getTimeOnly = (timestamp) => {
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const milliseconds = timestamp.seconds * 1000 + (timestamp.nanoseconds / 1000000);
    return dayjs(milliseconds).format("hh:mm A");
  } else if (typeof timestamp === 'string') {
    return dayjs(timestamp).format("hh:mm A");
  } else {
    console.error("Invalid timestamp in getTimeOnly:", timestamp);
    return "Invalid Time";
  }
};


const getDateOnly = (timestamp) => {
  let date;
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const milliseconds = timestamp.seconds * 1000 + (timestamp.nanoseconds / 1000000);
    date = dayjs(milliseconds);
  } else if (typeof timestamp === 'string') {
    date = dayjs(timestamp, { parse: true });
  } else {
    date = dayjs(timestamp);
  }

  if (!date.isValid()) {
    console.error("Invalid timestamp value:", timestamp);
    return "Invalid Date";
  }

  if (date.isToday()) return "Today";
  else if (date.isYesterday()) return "Yesterday";
  else if (date.isSameOrAfter(dayjs().subtract(7, 'days'))) return date.format('dddd');
  else return date.format('DD/MM/YYYY');
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
            <span className="cm__time">{`${getDateOnly(ele.timePosted)}, ${getTimeOnly(ele.timePosted)}`}</span>
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
            <span className="cm__time">{`${getDateOnly(ele.timePosted)}, ${getTimeOnly(ele.timePosted)}`}</span>
          </div>
        )
      )}
    </div>
  );
}

export default ChatContent;
