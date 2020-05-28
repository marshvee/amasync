/*global chrome*/
import React, { useState, useEffect } from "react";
import { Button, Container, Row ,Form} from "react-bootstrap";
import Register from "./Register";
import Login from "./Login";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
function Room() {
  const [registre, setRegistre] = useState(false);
  const [login, setLogin] = useState(false);
  const [buttons, setButtons] = useState(true);

  const [user, setUser] = useState(null);
  const [time, setTime] = useState(0);
  const [link, setLink] = useState("");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [join, setJoin] = useState(false);
  const [joined, setJoined] = useState(false);
  const [create, setCreate] = useState(false);


  let roomLink;
  let hostName;
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
        hostName = ans[1]
        newRoom = ans[2]
        if (roomLink) {
          setJoin(false);
          setCreate(false);
          setJoined(false);
          setLink(roomLink);
          if (hostName) {
            setName(hostName);
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
          setJoined(newRoom);
          setJoin(!newRoom);
          setRoom(params.session);
          setTime(params.time);
        } else {
          setJoin(false);
          setJoined(false);
        }
      });
    }, []); 

  function sendMessage(msg, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, msg, callback);
    });
  }

  function copyLink(){
    let elemlink= document.getElementById("link");
    elemlink.select()
    elemlink.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
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
      data: [nameInput, room],
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
    <Container>
      <h1 id="welcome">Welcome to Amasync{nameInput && <span>, {nameInput}</span>}!</h1>
      {buttons ?
        <>
          <Row>
            <Button
              className=" button-outline"
              onClick={() => { setRegistre(false); setCreate(!create); setJoin(false); setLogin(false); setButtons(false) }}
            >
              Anonymus
        </Button>
          </Row>

          <Row>      <Button
            className=" button-outline"

            onClick={() => { setRegistre(false); setCreate(false); setJoin(false); setLogin(!login); setButtons(false) }}
          >
            Log In
        </Button>
          
            <Button
              className=" button-outline"
              variant="outline-primary"
              onClick={() => { setRegistre(!registre); setCreate(false); setJoin(false); setLogin(false); setButtons(false) }}
            >
              Register
        </Button>
          </Row>
          
        </> :
        <>
          {link || joined ?
          
            <>
              {link &&   <div> <h3> Share this link with your friends</h3>
              <br/>
              <Row>
              <input id="link" value={link} readOnly/>
               
               
               <Button id="copy" onClick={copyLink}><FontAwesomeIcon  icon={faCopy}/></Button>
               </Row>
               </div>}
               {joined && <div> You're currently in the room of {hostName} </div>}
            </> : <>
            {join && (
            <div id="join">
              <h6>
                You're joining the room of: <span id="id-sala">{hostName}</span>
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
              {create && (
                <Form onSubmit={()=>{onCreateClick();setButtons(false)}}>
                
                  <Form.Group  controlId="formGridUsername">
                    <Form.Label>Name</Form.Label>
                    <Form.Row>
                    <Form.Control
                      required
                      id="nombre-host"
                    placeholder="Name"
                    value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                    </Form.Row>
                  </Form.Group>
                  <Button  id="start" type="submit">
                    Start party
            </Button>
            </Form>
                
              )}
              {login && (
                <Login setUser={setUser} />

              )}



              {
                registre &&
                <Register setUser={setUser} />

              }

<button id="back" onClick={()=>setButtons(true)}>
                    Back
          </button>
            </>}

        </>
      }

    </Container>
  );
}

export default Room;
