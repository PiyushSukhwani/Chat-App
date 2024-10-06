import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../../firebase/firebase";
import { ArrowBack, ArrowForward, Cancel, Search } from "@mui/icons-material";
import UserItem from "../useritem/UserItem";
import { useSelector } from "react-redux";
import { v4 as uuid} from "uuid";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

const UpdateGroupChat = ({ chatid, updateGroup }) => {
  const [searchName, setSearchName] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [addedContacts, setAddedContacts] = useState([]);
  const [user2, setUser2] = useState({});
  const currentUser = useSelector(state => state.userAuth.currentUser)

useEffect(() => {
  const fetchData = async () => {
    if (currentUser) {
      const userDoc = await getDoc(doc(db, "users", currentUser));
      setUser2(userDoc.data());

      const usersSnapshot = await getDocs(
        query(collection(db, "users"), where("uid", "!=", currentUser))
      );
      setUsers(
        usersSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
      );

      const chatRef = doc(db, "chats", chatid);
      const unsubscribe = onSnapshot(chatRef, (chatDoc) => {
        const members = chatDoc.data().members || [];
        const membersMail = chatDoc.data().membersMail || [];
        setAddedContacts(
          members.map((uid, index) => ({
            uid,
            umail: membersMail[index],
          }))
        );
      });
      
      return () => {
        unsubscribe();
      };

    }
  };

  fetchData();

}, [chatid, currentUser]);


  const filterUsers = (searchInp) => {
    const lowercasedInput = searchInp.toLowerCase();
    setFilteredUsers(
      users.filter(
        ({ data }) =>
          umailExtractor(data.umail).toLowerCase().includes(lowercasedInput) &&
          !addedContacts.some((contact) => contact.umail === data.umail)
      )
    );
  };

  const handleAddContact = (newContact) => {
    setAddedContacts((prevContacts) => [...prevContacts, newContact]);
    setSearchName("");
  };

  const createGroupHandler = async () => {
    if (addedContacts.length === 0) {
      toast.error("Add at least 1 contact", {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: false,
      });
      return;
    }

    await setDoc(
      doc(db, "chats", chatid),
      {
        chatid,
        lastTexted: new Date().toISOString(),
        members: addedContacts.map((contact) => contact.uid),
        membersMail: addedContacts.map((contact) => contact.umail),
        messages: [
          {
            content: `${umailExtractor(user2.umail)} added ${
              addedContacts.length
            } member(s)`,
            type: "info",
            timePosted: new Date().toISOString(),
            mid: uuid(),
          },
        ],
        timestamp: new Date(),
      },
      { merge: true }
    );

    toast.success("Group updated", {
      position: "top-left",
      autoClose: 2000,
      hideProgressBar: false,
    });

    updateGroup(false);
  };

  return (
    <div className="user__profile theme__bg theme__font">
      <div className="profile__header sticky__top theme__green__bg">
        <span onClick={() => updateGroup(false)}>
          <ArrowBack className="profile__back" />
        </span>
        <h2 className="theme__h2"> Add people to Group </h2>
      </div>

      <div className="profile__content">
        {addedContacts.length > 0 && (
          <div className="contact_add_list">
            {addedContacts.map(({ uid, umail }) => (
              <div key={uid} className="contact_add_item">
                <p>{umailExtractor(umail)}</p>
                <Cancel
                  onClick={() =>
                    setAddedContacts((prev) =>
                      prev.filter((contact) => contact.uid !== uid)
                    )
                  }
                  className="cancel_icn"
                />
              </div>
            ))}
          </div>
        )}

        <div className="search__container theme__search theme__input__bg">
          <Search className="search__icon" />
          <input
            spellCheck="false"
            className="search__inp theme__font"
            type="text"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              filterUsers(e.target.value);
            }}
            placeholder="Add contacts"
          />
        </div>

        <div className="chat__container">
          {searchName.length > 0 &&
            filteredUsers.map(
              ({ id, data: { uid, uname, umail, dp, status } }) => (
                <div key={id} onClick={() => handleAddContact({ uid, umail })}>
                  <UserItem
                    uname={uname}
                    umail={umail}
                    dp={dp}
                    status={status}
                  />
                </div>
              )
            )}

          <button className="create_group_btn" onClick={createGroupHandler}>
            <ArrowForward className="arr_icon" />
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UpdateGroupChat;
