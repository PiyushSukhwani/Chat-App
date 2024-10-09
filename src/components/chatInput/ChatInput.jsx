import React, { useEffect, useState } from "react";
import "./chatInput.css";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuid } from 'uuid';
import "emoji-picker-element";
import {
  DeleteForever,
  EmojiEmotions,
  EmojiEmotionsOutlined,
  MicNoneOutlined,
  Photo,
  Send,
} from "@mui/icons-material";
import { db } from "../../firebase/firebase";
import { arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore";
import upload from "../../firebase/upload";

const umailExtractor = (umail) => umail.slice(0, umail.lastIndexOf("@"));

function ChatInput({ rightScreenChat, user, updateScrollTimeout }) {
  const [textInput, setTextInput] = useState("");
  const [imgInput, setImageInput] = useState("");
  const [inputHeight, setInputHeight] = useState("25px");
  const [emojiOptions, setEmojiOptions] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleSendText = async () => {
    const messageContent = textInput.trim();
    
    if (!listening && (messageContent.length > 0 || imgInput.length > 0)) {
      const chatData = {
        mid: uuid(),
        uid: user.uid,
        from: umailExtractor(user.umail),
        img: imgInput,
        content: messageContent,
        timePosted: new Date().toISOString(),
        type: "common",
      };

      const chatDoc =
        rightScreenChat[1] === "group"
          ? rightScreenChat[0]
          : rightScreenChat[2];

      try {
        const chatRef = doc(db, "chats", chatDoc);
        await setDoc(
          chatRef,
          {
            messages: arrayUnion(chatData),
            lastTexted: new Date().toISOString(),
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );

        resetInputFields();
        updateScrollTimeout();
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.", {
          position: "bottom-left",
          autoClose: 2000,
        });
      }
    } else {
      toast.error(
        listening ? "Turn off mic before sending" : "Message is empty !!",
        {
          position: "bottom-left",
          autoClose: 2000,
        }
      );
    }
  };
  const resetInputFields = () => {
    setTextInput("");
    setInputHeight("25px");
    resetImage();
  };

  const uploadImage = (files) => {
    if (files[0] && files[0].type.includes("image")) {
      if (files[0].size < 4100000) {
        toast.dark("Attaching image", {
          position: "bottom-left",
          autoClose: 4300,
        });

        const imgUrl = upload(files[0])
        setImageInput(imgUrl)
      } else {
        toast.error("Keep image size below 4Mb", {
          position: "bottom-left",
          autoClose: 2000,
        });
      }
    } else {
      toast.error(files[0] ? "Not an image" : "No file selected", {
        position: "bottom-left",
        autoClose: 2000,
      });
    }
  };

  const resetImage = () => {
    setImageInput("");
    document.getElementById("img_upload_input").value = "";
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    autogrow(e);
  };

  const autogrow = (e) => {
    const height =
      e.target.scrollHeight <= 100 ? `${e.target.scrollHeight}px` : "100px";
    setInputHeight(height);
  };

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.log("Speech recognition is not supported in this browser.");
    }

    const chattextbar = document.getElementById("chattextbar");
    const picker = document.getElementById("emojiid");

    picker.addEventListener("emoji-click", (event) => {
      const emoji = event.detail.unicode;
      setTextInput((prev) => prev + emoji);
    });
  }, [browserSupportsSpeechRecognition]);

  return (
    <div className="chat__name__input theme__bg theme__font">
      <ToastContainer />

      <div
        className="emote"
        title="emote"
        onClick={listening ? null : () => setEmojiOptions(!emojiOptions)}
      >
        {emojiOptions ? (
          <EmojiEmotions className="emote__icon" />
        ) : (
          <EmojiEmotionsOutlined className="emote__icon" />
        )}
      </div>

      <label htmlFor="img_upload_input">
        <div className="emote" title="photo">
          <Photo className="emote__icon" />
        </div>
      </label>

      <div
        className="input__bar theme__input__bg"
        style={{ border: "1px solid grey" }}
      >
        <form
          style={{ width: "100%" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText();
          }}
        >
          <textarea
            id="chattextbar"
            spellCheck="false"
            placeholder="Type a message"
            style={{ height: inputHeight }}
            value={listening ? textInput + transcript : textInput}
            onChange={handleTextChange}
            className="input__bar__textarea theme__font"
          />
        </form>
      </div>

      <div
        onClick={
          listening
            ? () => SpeechRecognition.stopListening()
            : () => {
                resetTranscript();
                SpeechRecognition.startListening({ continuous: true });
                setEmojiOptions(false);
              }
        }
        className={`emote ${listening ? "mic_on" : ""}`}
        title="speech to text"
      >
        <MicNoneOutlined className="emote__icon" />
      </div>

      <div className="send_icon" title="send" onClick={handleSendText}>
        <Send className="emote__icon" style={{ padding: "3px" }} />
      </div>

      <emoji-picker
        id="emojiid"
        style={{ display: emojiOptions ? "block" : "none" }}
      ></emoji-picker>

      {imgInput && (
        <div className="img__upload__wrapper theme__bg">
          <div className="img__bundle">
            <img className="img__upload" src={imgInput} alt="" />
            <div className="rem_img_icon emote bg__grey" onClick={resetImage}>
              <DeleteForever className="del_icon" />
            </div>
          </div>
        </div>
      )}

      <input
        id="img_upload_input"
        style={{ display: "none" }}
        type="file"
        onChange={(event) => uploadImage(event.target.files)}
      />
    </div>
  );
}

export default ChatInput;
