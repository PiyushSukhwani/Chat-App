import React, { useState, useEffect, useContext } from "react";
import "./blockedList.css";
import {
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  collection,
} from "firebase/firestore";
import ChatItem from "../chatItem/ChatItem";
import { ArrowBack, Search } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebase/firebase";
import { resetRightScreenChat } from "../../store/chatSlice";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

function BlockedList({ change }) {
  const [selectedChat, setSelectedChat] = useState("0");
  const [searchName, setSearchName] = useState("");
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [user, setUser] = useState({ dp: "" });
  const currentUser = useSelector((state) => state.userAuth.currentUser);
  const dispatch = useDispatch();

  const changeSelectedChat = (chat) => {
    setSelectedChat(chat);
  };

  const filterFun = (arr, searchInp) => {
    if (searchInp.length) {
      setFilteredChats(
        arr.filter((ele) => {
          const chatNameMatch = ele.data.chatname
            .toLowerCase()
            .includes(searchInp.toLowerCase());
          const isPersonal = ele.data.type === "personal";
          const member1Match =
            umailExtractor(ele.data.membersMail[0]).includes(searchInp) &&
            ele.data.membersMail[0] !== user.umail;
          const member2Match =
            umailExtractor(ele.data.membersMail[1]).includes(searchInp) &&
            ele.data.membersMail[1] !== user.umail;

          return (
            chatNameMatch || (isPersonal && (member1Match || member2Match))
          );
        })
      );
    }
  };

  useEffect(() => {
    dispatch(resetRightScreenChat());

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser);

      const fetchUserData = async () => {
        try {
          const userDet = await getDoc(userDocRef);
          if (userDet.exists()) {
            setUser(userDet.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (user.blocked && user.blocked.length > 0) {
      const chatsQuery = query(
        collection(db, "chats"),
        where("chatid", "in", user.blocked),
        where("members", "array-contains", currentUser),
        orderBy("timestamp", "desc")
      );

      const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chatsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setChats(chatsData);
      });

      return () => unsubscribeChats();
    }
  }, [user, currentUser]);

  return (
    <div className="chat__list theme__bg theme__font">
      <div className="sticky__top theme__bg">
        <div className="chatlist__header theme__green__bg">
          <h2 className="theme__h2 blocked__header">
            <span onClick={() => change("chatList")}>
              <ArrowBack className="arch__back__icon" />
            </span>
            Blocked chats
          </h2>
        </div>
        <div className="search__container theme__search theme__input__bg">
          <Search className="search__icon" />
          <input
            spellCheck="false"
            className="search__inp theme__font"
            type="text"
            value={searchName}
            onChange={(e) => {
              const value = e.target.value;
              setSearchName(value);
              filterFun(chats, value);
            }}
            placeholder="Search or start new chat"
          />
        </div>
      </div>
      <div className="chatlist__container">
        <div className="chat__container">
          {(!searchName.length ? chats : filteredChats).map(({ id, data }) => (
            <ChatItem
              key={id}
              changeSelectedChat={changeSelectedChat}
              selectedChat={selectedChat}
              uid={user.uid}
              chatid={data.chatid}
              chatname={data.chatname}
              dp={data.dp}
              type={data.type}
              members={data.members}
              description={data.description}
              lastTexted={data.lastTexted}
              blocked={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlockedList;
