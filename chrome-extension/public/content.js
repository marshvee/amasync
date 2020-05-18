let me = { iAmhost: true };
let ws;

const PROTOCOL = {
  JOIN: "join",
  CREATE: "create",
  CREATED: "created",
  HOST_TIME: "hosttime",
  JOINED: "joined",
  MESSAGE: "message",
  MOVE: "move",
  PLAY: "play",
  PAUSE: "pause",
  RESTART: "restart",
  SEPARATOR: " ",
};

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  let action = msg.action.split(" ")[0];
  console.log(msg);
  if (action == "getUrl") {
    sendResponse(window.location.href);
  } else if (action == "connect") {
    createRoom(msg.data);
  } else if (action == "join") {
    joinRoom(msg.data[0], msg.data[1], msg.data[2]);
  } else if (action == "setup") {
    setup();
  } else if (action == "session") {
    saveSession(msg.action.split(" ")[1], msg.data);
  } else if (action == "get") {
    sendResponse(getStorage());
  } else if (action == "msgSent") {
    console.log("Content Sent " + msg.data);
    ws.send(
      PROTOCOL.MESSAGE +
        PROTOCOL.SEPARATOR +
        msg.data.replace(new RegExp(PROTOCOL.SEPARATOR, "g", "-")) +
        PROTOCOL.SEPARATOR +
        sessionStorage.getItem("name")
    );
  }
});

function getStorage() {
  let link = sessionStorage.getItem("link");
  let name = sessionStorage.getItem("name");
  let room = sessionStorage.getItem("room");
  return [link, room, name];
}

function saveSession(key, value) {
  sessionStorage.setItem(key, value);
}

function hostModePlay() {
  let videos = document.querySelectorAll("video");
  let video = videos[videos.length - 1];
  let temp = video.onplay;
  video.onplay = null;
  video.play().then(() => (videos[videos.length - 1].onplay = temp));
}

function hostModePause() {
  let videos = document.querySelectorAll("video");
  let video = videos[videos.length - 1];
  let temp = video.onpause;
  video.onpause = null;
  video.pause();
  setTimeout(() => {
    videos[videos.length - 1].onpause = temp;
  }, 1000);
}

function hostModeMove(time) {
  console.log("actualizando tiempo " + time);
  let videos = document.querySelectorAll("video");
  videos[videos.length - 1].currentTime = time;
}

function createRoom(name) {
  console.log("creatingsocket");
  let videos = document.querySelectorAll("video");
  let video = videos[videos.length - 1];
  ws = new WebSocket("ws://localhost:8080");
  ws.onmessage = onmessage;
  hostModePause();
  ws.onopen = () =>
    ws.send(
      PROTOCOL.CREATE +
        PROTOCOL.SEPARATOR +
        name +
        PROTOCOL.SEPARATOR +
        video.currentTime
    );
}

function joinRoom(name, room, time) {
  ws = new WebSocket("ws://localhost:8080");
  ws.onmessage = onmessage;
  ws.onopen = () =>
    ws.send(
      PROTOCOL.JOIN + PROTOCOL.SEPARATOR + name + PROTOCOL.SEPARATOR + room
    );
  me.iAmhost = false;
  let videos = document.querySelectorAll("video");
  videos[videos.length - 1].currentTime = time;
  hostModePause();
}

function setup() {
  let videos = document.querySelectorAll("video");
  let video = videos[videos.length - 1];
  video.onplay = (e) => {
    if (!me.iAmhost) {
      hostModePause();
    } else {
      console.log("content: host dio play");
      ws.send(PROTOCOL.PLAY);
    }
  };

  video.onpause = (e) => {
    console.log("pause");
    if (!me.iAmhost) {
      hostModePlay();
    } else {
      console.log("content: host dio pause");
      ws.send(PROTOCOL.PAUSE);
    }
  };

  let bar = document.querySelector(`#dv-web-player > div > div:nth-child(1) > div > div > 
         div:nth-child(2) > div > div > div.scalingUiContainerBottom > div > div.controlsOverlay > 
         div.bottomPanel > div:nth-child(1) > div > div.progressBarContainer`);
  if (bar === null) {
    function getElementByXpath(path) {
      return document.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    }
    bar = getElementByXpath(
      '//*[@id="dv-web-player"]/div/div[1]/div/div/div[2]/div/div/div/div[2]/div[1]/div[4]/div[2]/div[1]/div/div[2]'
    );
  }
  bar.onclick = () => {
    console.log("mover tiempo");
    if (!me.iAmhost) {
      ws.send(PROTOCOL.RESTART + PROTOCOL.SEPARATOR + PROTOCOL.MOVE);
      hostModePause();
    } else {
      console.log("content: host dio move");
      setTimeout(() => {
        ws.send(PROTOCOL.MOVE + PROTOCOL.SEPARATOR + video.currentTime);
      }, 1000);
    }
  };
}

function sendMessagePop(message) {
  chrome.runtime.sendMessage(message);
}

function onmessage(e) {
  console.log(e);
  let [action, ...rest] = e.data.split(PROTOCOL.SEPARATOR);
  switch (action) {
    case PROTOCOL.CREATED:
      let res = window.location.href;
      let roomID = rest[0];
      let name = rest[1];
      let time = rest[2];
      let prefix = res.includes("?") ? "&" : "?";
      let data =
        res + prefix + "session=" + roomID + "&name=" + name + "&time=" + time;
      sendMessagePop({ action: "link", data, ws });
      hostModePause();
      break;
    case PROTOCOL.PLAY:
      hostModePlay();
      break;
    case PROTOCOL.PAUSE:
      hostModePause();
      break;
    case PROTOCOL.JOINED:
      sendMessagePop({ action: "joined", data: rest[0] });
      hostModePause();
      break;
    case PROTOCOL.HOST_TIME:
      let videos = document.querySelectorAll("video");
      let video = videos[videos.length - 1];
      hostModePause();
      ws.send(
        PROTOCOL.HOST_TIME +
          PROTOCOL.SEPARATOR +
          rest[0] +
          PROTOCOL.SEPARATOR +
          video.currentTime
      );
      break;
    case PROTOCOL.MOVE:
      hostModeMove(rest[0]);
      break;
  }
}
