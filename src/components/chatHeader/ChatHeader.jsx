import React, { useState, useEffect, useContext } from "react";
import "./chatHeader.css";
import { ArrowBack } from "@mui/icons-material";
import { db } from "../../firebase/firebase";
// import { UpdateMobileView } from '../../App';

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

function ChatHeader({ rightScreenChat, updateChatDetailsVisibility }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [chatHeader, setChatHeader] = useState({
    dp: "https://res.cloudinary.com/dpjkblzgf/image/upload/v1624507908/mess_zq9mov.png",
    chatName: "Loading...",
    name: "Loading...",
    description: "",
  });

  //   const updateMobileView = useContext(UpdateMobileView);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    const fetchChatHeader = async () => {
      try {
        const docRef =
          rightScreenChat[1] === "group"
            ? doc(db, "chats", rightScreenChat[0])
            : doc(db, "users", rightScreenChat[0]);

        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setChatHeader(
            rightScreenChat[1] === "group"
              ? {
                  dp: data.dp,
                  chatName: data.chatname,
                  description: data.description,
                }
              : {
                  dp: data.dp,
                  name: data.uname,
                  umail: data.umail,
                  status: data.status,
                }
          );
        }
      } catch (error) {
        console.error("Error fetching chat header:", error);
      }
    };

    fetchChatHeader();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [rightScreenChat]);

  return (
    <div
      className="theme__green__bg chat__header theme__font"
      onClick={() => updateChatDetailsVisibility(true)}
      style={{ position: "relative" }}
    >
      <div className="chat__user__details__wrapper">
        {screenWidth < 600 && (
          <span onClick={() => updateMobileView(true)}>
            <ArrowBack className="arch__back__icon" />
          </span>
        )}
        <img src={chatHeader.dp} alt="User" className="ch__user__img" />
        <div className="chat__user__details">
          {rightScreenChat[1] === "personal" ? (
            <>
              <h4 className="theme__h4">
                {chatHeader.name}
                <span className="theme__uname">
                  {chatHeader.umail
                    ? `@${umailExtractor(chatHeader.umail)}`
                    : ""}
                </span>
              </h4>
              <h5 className="theme__h5 theme__subfont">{chatHeader.status}</h5>
            </>
          ) : (
            <>
              <h4 className="theme__h4">{chatHeader.chatName}</h4>
              <h5 className="theme__h5 theme__subfont">
                {chatHeader.description}
              </h5>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
