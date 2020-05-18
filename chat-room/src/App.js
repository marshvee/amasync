/*global chrome*/
import React, { useEffect, useState } from "react";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

function App() {
  const [visible, setVisible] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);

  const openChat = () => {
    setVisible(true);
  };

  useEffect(() => {
    chrome.extension.onMessage.addListener((message, sender, sendResponse) => {
      console.log(message.action);
      switch (message.action) {
        case "joined":
          openChat();
          break;
        case "session link":
          openChat();
          break;
        case "msgReceived":
          onNewChatMsg(message.data);
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (visible) {
      document.getElementById("dv-web-player").classList.add("web-player");
      document
        .getElementById("amasync-chatroom")
        .classList.add("amasync-chatroom");
    }
  }, [visible]);

  function sendMessagePop(message) {
    chrome.runtime.sendMessage("", message, {}, () => {
      console.log(chrome.runtime.lastError);
    });
  }

  const onNewChatMsg = (msg) => {
    console.log("Received " + msg);
    setChatMsgs((pm) => {
      const nPm = [...pm];
      nPm.push(msg);
      return nPm;
    });
  };

  const sendChatMsg = (msg) => {
    console.log("Sending " + msg);
    sendMessagePop({ action: "msgSent", data: msg });
  };

  return visible && <ChatRoom messages={chatMsgs} sendMessage={sendChatMsg} />;
}

export default App;
