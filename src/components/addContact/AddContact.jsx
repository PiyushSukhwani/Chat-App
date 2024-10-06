import React, { useState, useEffect } from "react";
import "./addContact.css";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  onSnapshot,
  query,
  where,
  limit,
  Timestamp,
  collection,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../../firebase/firebase";
import { ArrowBack, Search } from "@mui/icons-material";
import UserItem from "../useritem/UserItem";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

const AddContact = ({ change }) => {
  const [searchName, setSearchName] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [user5, setUser5] = useState({ dp: "" });
  const currentUser = useSelector((state) => state.userAuth.currentUser);

  const addChatHandler = async (uid, umail) => {
    const userDocRef = doc(db, "users", currentUser);
    const snapshot = await getDoc(userDocRef);

    if (snapshot.data()?.friends?.includes(uid)) {
      toast.error("Connection Chat already exists", {
        position: "bottom-left",
        autoClose: 2000,
      });
    } else {
      await setDoc(
        userDocRef,
        {
          friends: arrayUnion(uid),
        },
        { merge: true }
      );

      const targetUserDocRef = doc(db, "users", uid);
      await setDoc(
        targetUserDocRef,
        {
          friends: arrayUnion(currentUser),
        },
        { merge: true }
      );

      const dok = uuidv4();
      await setDoc(doc(db, "chats", dok), {
        chatid: dok,
        chatname: "",
        description: "",
        dp: "",
        lastTexted: new Date().toISOString(),
        members: [currentUser, uid],
        membersMail: [user5.umail, umail],
        messages: [
          {
            content: `${umailExtractor(
              user5.umail
            )} connected with ${umailExtractor(umail)}`,
            type: "info",
            timePosted: new Date().toISOString(),
            mid: uuidv4(),
          },
        ],
        timestamp: Timestamp.now(),
        type: "personal",
      });
      change("chatList");
    }
  };

  const filterFun = (searchInp) => {
    if (searchInp.length) {
      setFilteredUsers(
        users.filter(({ data }) =>
          umailExtractor(data.umail)
            .toLowerCase()
            .includes(searchInp.toLowerCase())
        )
      )
    }
  };

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser);

      const fetchUserData = async () => {
        try {
          const userDet = await getDoc(userDocRef);
          if (userDet.exists()) {
            setUser5(userDet.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();

      const usersQuery = query(
        collection(db, "users"),
        where("uid", "!=", currentUser),
        limit(10)
      );

      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setUsers(usersData);
      });
      return () => unsubscribeUsers();
    }
  }, [currentUser]);

  return (
    <div className="chat__list theme__bg theme__font">
      <ToastContainer
        position="bottom-left"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        draggable={false}
      />
      <div className="sticky__top theme__bg">
        <div className="chatlist__header theme__green__bg">
          <h2 className="theme__h2 archived__header">
            <span onClick={() => change("chatList")}>
              <ArrowBack className="arch__back__icon" />
            </span>
            Add new contact
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
              filterFun(value);
            }}
            placeholder="Enter contact name"
          />
        </div>
      </div>
      <div className="chatlist__container">
        <div className="chat__container">
          {searchName.length > 0 &&
            filteredUsers.map(
              ({ id, data: { uid, uname, umail, dp, status } }) => (
                <div key={id} onClick={() => addChatHandler(uid, umail)}>
                  <UserItem
                    uname={uname}
                    umail={umail}
                    dp={dp}
                    status={status}
                  />
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};

export default AddContact;
