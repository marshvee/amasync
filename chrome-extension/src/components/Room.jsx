/*global chrome*/
import React, { useRef, useState, useEffect } from "react";

function Room() {
  const nameRef = useRef();
  const roomRef = useRef();
  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(true);
  const [joined, setJoined] = useState(false);

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
    const roomLink = localStorage.getItem("link");
    if (roomLink) {
      setJoin(false);
      setCreate(false);
      setLink(roomLink);
    }
    const myName = localStorage.getItem("name");
    console.log("aquita", myName);

    if (myName) {
      setName(myName);
      nameRef.current.value = myName;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log(message);
      switch (message.action) {
        case "link":
          localStorage.setItem("link", message.data);
          setCreate(false);
          setLink(message.data);
          break;
        case "joined":
          setJoin(false);
          setJoined(true);
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
        setJoin(true);
        roomRef.current.textContent = params.session;
      } else {
        setJoin(false);
        setCreate(true);
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
      data: nameRef.current.value,
    });
    saveName(nameRef.current.value);
  };

  const onJoinClick = () => {
    sendMessage({ action: "setup" });
    sendMessage({
      action: "join",
      data: nameRef.current.value + ":" + roomRef.current.textContent,
    });
    saveName(nameRef.current.value);
  };

  const saveName = (myName) => {
    localStorage.setItem("name", myName);
    console.log("saved name");

    setName(myName);
  };

  return (
    <div>
      <h1>Welcome to Amasync {!!name && <span>{name}</span>}</h1>

      {create && (
        <div id="new">
          <h6>Your name: </h6>
          <input id="nombre-host" placeholder="Name" ref={nameRef} />
          <button id="start" onClick={onCreateClick}>
            Start party
          </button>
        </div>
      )}
      {join && (
        <div id="join">
          <h6>
            You're joining room: <span id="id-sala" ref={roomRef}></span>
          </h6>
          <h6>Please insert your name: </h6>
          <input id="nombre" placeholder="Name" ref={nameRef} />
          <button id="join" onClick={onJoinClick}>
            Join
          </button>
        </div>
      )}
      {!!link && <div> Share this link with your friends {link}</div>}
      {joined && <div>Successfully joined! </div>}
    </div>
  );
}

export default Room;
