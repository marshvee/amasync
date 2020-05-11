/*global chrome*/
import React, { useState, useEffect } from "react";

function Room() {

  const [time, setTime] = useState(0);
  const [link, setLink] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [join, setJoin] = useState(false);
  const [joined, setJoined] = useState(false);
  const [create, setCreate] = useState(true);

  let roomLink;
  let myName;
  let newRoom;

  function getQueryParams(url) {
    let queryParams = {};
    //create an anchor tag to use the property called search
    let anchor = document.createElement("a");
    //assigning url to href of anchor tag
    anchor.href = url;
    //search property returns the query string of url
    let queryStrings = anchor.search.substring(1);
    let params = queryStrings.split("&");

    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split("=");
      queryParams[pair[0]] = decodeURIComponent(pair[1]);
    }
    return queryParams;
  }

  useEffect(() => {
    sendMessage({ action: "get" }, (ans) => {
      roomLink = ans[0]
      myName = ans[1]
      newRoom = ans[2]
      if (roomLink) {
        setJoin(false);
        setCreate(false);
        setJoined(false);
        setLink(roomLink);
        if (myName) {
          setName(myName);
          setNameInput(myName);
        }
      }
      if (newRoom) {
        setRoom(newRoom);
        setJoin(false);
        setCreate(false);
        setJoined(false);
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log(message);
      switch (message.action) {
        case "link":
          sendMessage({ action: "session link", data: message.data })

          setJoin(false);
          setCreate(false);
          setJoined(false);
          setLink(message.data);
          break;
        case "joined":
          setJoin(false);
          setCreate(false);
          setJoined(true);
          saveRoom(message.data);
          break;
        default:
          break;
      }
    });

    chrome.tabs.getSelected(null, (tab) => {
      let url = tab.url;
      let params = getQueryParams(url);
      if ("session" in params) {
        setCreate(false);
        setJoined(!!newRoom);
        setJoin(!newRoom);
        setRoom(params.session);
        setTime(params.time);
      } else {
        setJoin(false);
        setJoined(false);
        setCreate(!roomLink);
      }
    });
  }, []);

  function sendMessage(msg, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, msg, callback);
    });
  }

  const onCreateClick = () => {
    sendMessage({ action: "setup" });
    sendMessage({
      action: "connect",
      data: nameInput,
    });
    saveName(nameInput);
  };

  const onJoinClick = () => {
    sendMessage({ action: "setup" });
    sendMessage({
      action: "join",
      data: [nameInput, room, time],
    });
    saveName(nameInput);
  };

  const saveName = (newName) => {
    sendMessage({ action: "session name", data: newName })
    setName(newName);
  };

  const saveRoom = (newRoom) => {
    sendMessage({ action: "session room", data: newRoom })
    setRoom(newRoom);
  };

  return (
    <div>
      <h1>Welcome to Amasync{!!name && <span>, {name}</span>}!</h1>

      {create && (
        <div id="new">
          <h6>Your name: </h6>
          <input
            id="nombre-host"
            placeholder="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button id="start" onClick={onCreateClick}>
            Start party
          </button>
        </div>
      )}
      {join && (
        <div id="join">
          <h6>
            You're joining room: <span id="id-sala">{room}</span>
          </h6>
          <h6>Please insert your name: </h6>
          <input
            id="nombre"
            placeholder="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button id="join" onClick={onJoinClick}>
            Join
          </button>
        </div>
      )}
      {!!link && <div> Share this link with your friends {link}</div>}
      {joined && <div> You're currently in room {room}</div>}
    </div>
  );
}

export default Room;
