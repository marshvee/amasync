let me = { iAmhost: true };

const PROTOCOL = {
  JOIN: "JOIN",
  CREATE: "CREATE",
  CREATED: "CREATED",
  JOINED: "JOINED",
  PLAY: "PLAY",
  PAUSE: "PAUSE",
  SEPARATOR: ":",
};

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action == "getUrl") {
    sendResponse(window.location.href);
  } else if (msg.action == "connect") {
    createRoom(msg.data);
  } else if (msg.action == "join") {
    joinRoom(msg.data);
  } else if (msg.action == "setup") {
    console.log(msg);
    document.querySelectorAll("video")[0].onplay = (e) => {
      console.log("si es esa");
      if (!me.iAmhost) {
        hostModePause();
      } else {
        console.log("content: host dio play");
        ws.send(PROTOCOL.PLAY);
      }
    };

    document.querySelectorAll("video")[0].onpause = (e) => {
      console.log("pause");
      if (!me.iAmhost) {
        hostModePlay();
      } else {
        console.log("content: host dio pause");
        ws.send(PROTOCOL.PAUSE);
      }
    };
  }
});

function hostModePlay() {
  let video = document.querySelectorAll("video")[0];
  let temp = video.onplay;
  video.onplay = null;
  video.play().then(() => (video.onplay = temp));
}

function hostModePause() {
  let video = document.querySelectorAll("video")[0];
  let temp = video.onpause;
  video.onpause = null;
  video.pause();
  video.onpause = temp;
}

function createRoom(name) {
  console.log("creatingsocket");
  ws = new WebSocket("ws://localhost:3000");
  ws.onmessage = onmessage;
  ws.onopen = () => ws.send(PROTOCOL.CREATE + PROTOCOL.SEPARATOR + name);
}

function joinRoom(msg) {
  ws = new WebSocket("ws://localhost:3000");
  ws.onmessage = onmessage;
  ws.onopen = () => ws.send(PROTOCOL.JOIN + PROTOCOL.SEPARATOR + msg);
  me.iAmhost = false;
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
      let prefix = res.includes("?") ? "&" : "?";
      let data = res + prefix + "session=" + rest[0];
      sendMessagePop({ action: "link", data });
      break;
    case PROTOCOL.PLAY:
      hostModePlay();
      break;
    case PROTOCOL.PAUSE:
      hostModePause();
      break;
    case PROTOCOL.JOINED:
      console.log("llego joined a content");
      sendMessagePop({ action: "joined" });
  }
}
