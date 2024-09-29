import React, { useState, useEffect, useContext } from "react";
import "./createGroupChat.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  ArrowBack,
  ArrowForward,
  CameraAlt,
  Cancel,
  Edit,
  Search,
} from "@mui/icons-material";
import UserItem from "../useritem/UserItem";
import { useSelector } from "react-redux";
import { db } from "../../firebase/firebase";
import upload from "../../firebase/upload";
import { v4 as uuid } from "uuid";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

function CreateGroupChat({ change }) {
  const [searchName, setSearchName] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [addedContactsMail, setAddedContactsMail] = useState([]);
  const [addedContacts, setAddedContacts] = useState([]);
  const [addedContactsUid, setAddedContactsUid] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupImage, setGroupImage] = useState(
    "https://res.cloudinary.com/dpjkblzgf/image/upload/v1623514492/Frame_2_rsaqpn.png"
  );
  const [user2, setUser2] = useState({});
  const currentUser = useSelector((state) => state.userAuth.currentUser);

  const filterFun = (searchInp) => {
    if (searchInp.length) {
      setFilteredUsers(
        users.filter(
          (ele) =>
            umailExtractor(ele.data.umail)
              .toLowerCase()
              .includes(searchInp.toLowerCase()) &&
            !addedContactsMail.includes(ele.data.umail)
        )
      );
    }
  };

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser);

      const fetchUserData = async () => {
        try {
          const userDet = await getDoc(userDocRef);
          if (userDet.exists()) {
            setUser2(userDet.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();

      const userQuery = query(
        collection(db, "users"),
        where("uid", "!=", currentUser)
      );

      const unsubscribeUsers = onSnapshot(userQuery, (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setUsers(usersData);
      });
      return () => unsubscribeUsers();
    }
  }, [currentUser]);

  const createGroupHandler = async () => {
    if (!groupName.trim().length) {
      toast.error("Enter Group Name", {
        position: "top-left",
        autoClose: 2000,
      });
      return;
    }

    if (!addedContacts.length) {
      toast.error("Add at least 1 contact", {
        position: "top-left",
        autoClose: 2000,
      });
      return;
    }

    const chatId = uuid();

    try {
      await setDoc(doc(db, "chats", chatId), {
        chatid: chatId,
        chatname: groupName.trim(),
        description: description.trim(),
        dp: groupImage,
        lastTexted: new Date(),
        members: [...addedContactsUid, currentUser],
        membersMail: [...addedContactsMail, user2.umail],
        messages: [
          {
            content: `${umailExtractor(user2.umail)} created this group with ${
              addedContactsUid.length
            } other(s)`,
            type: "info",
            timePosted: new Date(),
            mid: uuid(),
          },
        ],
        timestamp: new Date(),
        type: "group",
      });

      // change("chatlist");
    } catch (error) {
      console.error("Error creating group: ", error);
      toast.error("Failed to create group. Please try again.", {
        position: "top-left",
        autoClose: 2000,
      });
    }
  };

  const uploadImage = async (files) => {
    if (files[0] && files[0].type.includes("image")) {
      if ((files[0].size < 10, 486, 100)) {
        toast.dark("Uploading image", {
          position: "bottom-left",
          autoClose: 4300,
        });

        try {
          const imgUrl = await upload(files[0]);
          setGroupImage(imgUrl);
        } catch (error) {
          toast.error("Error uploading image", {
            position: "bottom-left",
            autoClose: 2000,
          });
        }
      } else {
        toast.error("Keep image size below 10Mb", {
          position: "bottom-left",
          autoClose: 2000,
        });
      }
    } else {
      if (files[0]) {
        toast.error("Not an image", {
          position: "bottom-left",
          autoClose: 2000,
        });
      }
    }
  };

  return (
    <div className="user__profile theme__bg theme__font">
      <div className="profile__header sticky__top theme__green__bg">
        <span onClick={() => change("chatlist")}>
          <ArrowBack className="profile__back" />
        </span>
        <h2 className="theme__h2">Create Group</h2>
      </div>

      <div className="profile__content">
        <div className="profile__image">
          <img src={groupImage} alt="" />
          <input
            id="uploadId"
            type="file"
            onChange={(event) => uploadImage(event.target.files)}
          />
          <ToastContainer
            position="bottom-left"
            autoClose={2500}
            hideProgressBar={false}
            closeOnClick
          />
          <label htmlFor="uploadId">
            <h3 className="chpic theme__h3">
              <CameraAlt className="cam__icon" /> Add Photo
            </h3>
          </label>
        </div>

        <h3 className="theme__h3 edit__head">
          Group Name
          <label htmlFor="name">
            <Edit className="edit__pen" />
          </label>
        </h3>
        <div className="inp__name">
          <input
            id="name"
            spellCheck="false"
            className="theme__font"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <h3 className="about__prof theme__h3 edit__head">
          Description
          <label htmlFor="about">
            <Edit className="edit__pen" />
          </label>
        </h3>
        <div className="inp__status">
          <input
            id="about"
            maxLength="50"
            placeholder="( optional )"
            spellCheck="false"
            className="status__inp theme__font"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <h3 className="theme__h3 noc">{50 - description.length}</h3>

        {addedContacts.length > 0 && (
          <div className="contact_add_list">
            {addedContacts.map((ele) => (
              <div key={ele.uid} className="contact_add_item">
                <p>{umailExtractor(ele.umail)}</p>
                <Cancel
                  onClick={() => {
                    setAddedContacts((prev) => prev.filter((e) => e !== ele));
                    setAddedContactsMail((prev) =>
                      prev.filter((e) => e !== ele.umail)
                    );
                    setAddedContactsUid((prev) =>
                      prev.filter((e) => e !== ele.uid)
                    );
                    setSearchName("");
                  }}
                  className="cancel_icn"
                />
              </div>
            ))}
          </div>
        )}

        <div
          style={{ marginTop: "20px" }}
          className="search__container theme__search theme__input__bg"
        >
          <Search className="search__icon" />
          <input
            spellCheck="false"
            className="search__inp theme__font"
            type="text"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              filterFun(e.target.value);
            }}
            placeholder="Add contacts"
          />
        </div>
        <div className="chat__container">
          {searchName.length > 0 &&
            filteredUsers.map(
              ({ id, data: { uid, uname, umail, dp, status } }) => (
                <div
                  key={id}
                  onClick={() => {
                    setAddedContacts((prev) => [...prev, { uid, umail }]);
                    setAddedContactsMail((prev) => [...prev, umail]);
                    setAddedContactsUid((prev) => [...prev, uid]);
                    setSearchName("");
                  }}
                >
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
    </div>
  );
}

export default CreateGroupChat;
