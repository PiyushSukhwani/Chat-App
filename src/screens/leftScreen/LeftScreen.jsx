import React, { useState } from "react";
import UserProfile from "../../components/userProfile/UserProfile";
import ChatList from "../../components/chatList/ChatList";
import ArchievedList from "../../components/archieved/ArchievedList";
import BlockedList from "../../components/blocked/Blocked";
import AddContact from "../../components/addContact/AddContact";
import CreateGroupChat from "../../components/createGroupChat/CreateGroupChat";

const LeftScreen = () => {
  const [leftScreen, setLeftScreen] = useState("chatList");
  const leftScreenChange = (component) => setLeftScreen(component);
  return (
    <div className="left__screen">
      {leftScreen == "userProfile" && <UserProfile change={leftScreenChange} />}
      {leftScreen == "chatList" && <ChatList change={leftScreenChange} />}
      {leftScreen == "archieved" && <ArchievedList change={leftScreenChange} />}
      {leftScreen == "blocked" && <BlockedList change={leftScreenChange} />}
      {leftScreen == "createUserChat" && (
        <AddContact change={leftScreenChange} />
      )}
      {leftScreen == "createGroupChat" && (
        <CreateGroupChat change={leftScreenChange} />
      )}
    </div>
  );
};

export default LeftScreen;
