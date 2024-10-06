import React, { useState, useEffect, useContext } from "react";
import "./rightScreen.css";
import { onSnapshot, doc, getDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { db } from "../../firebase/firebase";
import ChatHeader from "../../components/chatHeader/ChatHeader";
import UpdateGroupChat from "../../components/updateGroupChat/UpdateGroupChat";
import ChatInput from "../../components/chatInput/ChatInput";
import ChatContent from "../../components/chatContent/ChatContent";
import ChatDetails from "../../components/chatDetails/ChatDetails";

const RightScreen = () => {
  const [groupUpdate, setGroupUpdate] = useState(false);
  const [count, setCount] = useState("0");
  const [isChatDetailsActive, setIsChatDetailsActive] = useState(false);
  const [user0, setUser0] = useState({});
  const currentUser = useSelector((state) => state.userAuth.currentUser);
  const rightScreenChat = useSelector(state => state.chat.rightScreenChat)

  const updateScroll = () => {
    const element = document.getElementById("chat__messages__content");
    if (element) element.scrollTop = element.scrollHeight;
  };

  const updateScrollTimeout = () => {
    setTimeout(updateScroll, 10);
  };

  const updateChatDetailsVisibility = (status) => {
    setIsChatDetailsActive(status);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser));
          if (userDoc.exists()) {
            setUser0(userDoc.data());
          } else {
            setUser0(null);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setUser0(null);
      }
    };

    fetchUser();
  }, [currentUser]);

  useEffect(() => {
    if (rightScreenChat.length > 0) {
      const chatId = rightScreenChat[3];
      const unsubscribeFromChat = onSnapshot(doc(db, "chats", chatId), () => {
        setCount(uuid());
      });
      updateChatDetailsVisibility(false);

      return () => {
        unsubscribeFromChat();
      };
    }
  }, [rightScreenChat]);

  return (
    <>
      {!isChatDetailsActive ? (
        <div className="right__screen">
          {!rightScreenChat.length > 0 ? (
            <div className="nc__selected theme__dark">
              <div className="overlay_cmp"></div>
              <div className="center_content">
                <img
                  className="img__right"
                  src="https://res.cloudinary.com/dpjkblzgf/image/upload/v1624266352/user_1_f2gpxz.svg"
                  alt=""
                />
                <h4 className="theme__font choose__chat">
                  Choose a chat to display messages...
                </h4>
              </div>
            </div>
          ) : (
            <>
              <div className="overlay"></div>
              <div className="chat__header__wrapper">
                <ChatHeader
                  rightScreenChat={rightScreenChat}
                  updateChatDetailsVisibility={updateChatDetailsVisibility}
                />
              </div>
              {rightScreenChat.length > 0 && (
                <div
                  id="chat__messages__content"
                  className="chat__messages__content"
                  style={{ marginBottom: `62px` }}
                >
                  <ChatContent
                    count={count}
                    rightScreenChat={rightScreenChat}
                    updateScrollTimeout={updateScrollTimeout}
                    user={user0}
                  />
                </div>
              )}
              <div id="chat__input__wrapper" className="chat__input__wrapper">
                <ChatInput
                  rightScreenChat={rightScreenChat}
                  user={user0}
                  updateScrollTimeout={updateScrollTimeout}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {groupUpdate ? (
            <UpdateGroupChat
              chatid={rightScreenChat[3]}
              updateGroup={setGroupUpdate}
            />
          ) : (
            <ChatDetails
              rightScreenChat={rightScreenChat}
              user={user0}
              updateChatDetailsVisibility={updateChatDetailsVisibility}
              updateGroup={setGroupUpdate}
            />
          )}
        </>
      )}
    </>
  );
};

export default RightScreen;
