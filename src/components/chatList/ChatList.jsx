import React, { useState, useEffect, useContext } from "react";
import "./chatList.css";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import ChatItem from "../chatItem/ChatItem";
import { Add, Brightness4, MoreHoriz, Search } from "@mui/icons-material";
import { ClickAwayListener } from "@mui/material";
import { auth, db, signOut } from "../../firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../store/userAuthStore";
import { resetRightScreenChat } from "../../store/chatSlice";
import { updateTheme } from "../../App";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

function ChatList({ change }) {
  const currentUser = useSelector((state) => state.userAuth.currentUser);
  const [theme, setTheme] = useState("dark");
  const dispatch = useDispatch();
  const [selectedChat, setSelectedChat] = useState("0");
  const [searchName, setSearchName] = useState("");
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [user0, setUser0] = useState({
    dp: "",
  });
  const [menuOptions, setMenuOptions] = useState(false);
  const [newChatOptions, setNewChatOptions] = useState(false);
  const updateAppTheme = useContext(updateTheme)

  const changeSelectedChat = (chat) => {
    setSelectedChat(chat);
  };

  const signout = () => {
    // signOut(auth).then(() => updateAuth(false));
    signOut(auth);
    dispatch(resetRightScreenChat());
    dispatch(logOut);
  };

  const filterFun = (arr, searchInp) => {
    if (searchInp.length) {
      setFilteredChats(
        arr.filter((ele) => {
          const chatNameMatch = ele.data.chatname
            .toLowerCase()
            .includes(searchInp.toLowerCase());
          const isPersonalChat = ele.data.type === "personal";
          const member1Match =
            isPersonalChat &&
            umailExtractor(ele.data.membersMail[0])
              .toLowerCase()
              .includes(searchInp.toLowerCase()) &&
            ele.data.membersMail[0] !== user0.umail;
          const member2Match =
            isPersonalChat &&
            umailExtractor(ele.data.membersMail[1])
              .toLowerCase()
              .includes(searchInp.toLowerCase()) &&
            ele.data.membersMail[1] !== user0.umail;
          return chatNameMatch || member1Match || member2Match;
        })
      );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // dispatch(resetRightScreenChat());

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser0(userData);
            
            const q = query(
              collection(db, "chats"),
              where('members', "array-contains", currentUser),
              orderBy("timestamp", "desc")
            );
            
            const unsubscribeChats = onSnapshot(q, (snapshot) => {
              setChats(
                snapshot.docs.map((doc) => ({
                  id: doc.id,
                  data: doc.data(),
                  userid: currentUser,
                  usermail: userData.umail,
                  userArchieved: userData.archived,
                  userBlocked: userData.blocked,
                }))
              );
            });
            
            return () => unsubscribeChats();
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="chat__list theme__bg theme__font">
      <div className="sticky__top theme__bg">
        <div className="chatlist__header theme__green__bg archieved__header">
          <img
            onClick={() => change("userProfile")}
            className="user__img"
            src={user0.dp}
            alt=""
          />
          <div className="chat__icons">
            <span title="Theme" className="menu__span" onClick={updateAppTheme}>
              <Brightness4 className="chat__icon" />
            </span>
            <ClickAwayListener onClickAway={() => setNewChatOptions(false)}>
              <span
                title="New chat"
                className="menu__span"
                onClick={() => setNewChatOptions(!newChatOptions)}
              >
                <Add className="chat__icon" />
                {newChatOptions && (
                  <div
                    className="menu__options theme__input__bg"
                    style={{ border: "1px solid grey" }}
                  >
                    <div
                      onClick={() => change("createUserChat")}
                      className="menu__option__item"
                    >
                      Add new contact
                    </div>
                    <div
                      onClick={() => change("createGroupChat")}
                      className="menu__option__item"
                    >
                      Create group
                    </div>
                  </div>
                )}
              </span>
            </ClickAwayListener>
            <ClickAwayListener onClickAway={() => setMenuOptions(false)}>
              <span
                title="Menu"
                className="menu__span"
                onClick={() => setMenuOptions(!menuOptions)}
              >
                <MoreHoriz className="chat__icon" />
                {menuOptions && (
                  <div
                    className="menu__options theme__input__bg"
                    style={{ border: "1px solid grey" }}
                  >
                    <div
                      onClick={() => change("userProfile")}
                      className="menu__option__item"
                    >
                      User Profile
                    </div>
                    <div
                      onClick={() => change("archieved")}
                      className="menu__option__item"
                    >
                      Archived
                    </div>
                    <div
                      onClick={() => change("blocked")}
                      className="menu__option__item"
                    >
                      Blocked
                    </div>
                    <div onClick={signout} className="menu__option__item">
                      Logout
                    </div>
                  </div>
                )}
              </span>
            </ClickAwayListener>
          </div>
        </div>
        <div className="search__container theme__search theme__input__bg">
          <Search className="search__icon" />
          <input
            spellCheck="false"
            className="search__inp theme__font"
            type="text"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              filterFun(chats, e.target.value);
            }}
            placeholder="Search a chat by group name or user unique id"
          />
        </div>
      </div>
      <div className="chatlist__container">
        <div className="chat__container">
          {(!searchName.length ? chats : filteredChats).map(
            ({
              id,
              userid,
              usermail,
              userArchieved,
              userBlocked,
              data: {
                chatid,
                chatname,
                dp,
                type,
                members,
                membersMail,
                description,
                lastTexted,
              },
            }) => (
              <div key={id}>
                {!userArchieved.includes(chatid) &&
                  !userBlocked.includes(chatid) && (
                    <ChatItem
                      changeSelectedChat={changeSelectedChat}
                      selectedChat={selectedChat}
                      uid={userid}
                      umail={usermail}
                      chatid={chatid}
                      chatname={chatname}
                      dp={dp}
                      type={type}
                      members={members}
                      description={description}
                      membersMail={membersMail}
                      lastTexted={lastTexted}
                    />
                  )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatList;
