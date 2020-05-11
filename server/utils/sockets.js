const WebSocket = require("ws");
const rooms = require("./rooms");

const PROTOCOL = {
  JOIN: "JOIN",
  CREATE: "CREATE",
  CREATED: "CREATED",
  JOINED: "JOINED",
  PLAY: "PLAY",
  PAUSE: "PAUSE",
  SEPARATOR: ":",
};

class Message {
  constructor(msg) {
    const data = msg.split(PROTOCOL.SEPARATOR);
    this.cmd = data[0];
    this.args = data.slice(1);
  }

  isJoinRequest() {
    return this.cmd === PROTOCOL.JOIN;
  }
  getRoomID() {
    if (this.isJoinRequest()) {
      return this.args[0];
    }
    throw Error(`Message is not JOIN ${this.cmd}: ${this.args}`);
  }

  isCreateRequest() {
    return this.cmd === PROTOCOL.CREATE;
  }
  getUser() {
    if (this.isCreateRequest()) {
      return this.args[0];
    }
    throw Error(`Message is not CREATE ${this.cmd}: ${this.args}`);
  }

  isControlRequest() {
    return this.cmd === PROTOCOL.PLAY || this.cmd === PROTOCOL.PAUSE;
  }
}

const Sockets = function () {
  const sockets = this || {};
  sockets.setup = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
      ws.on("message", (msg) => {
        let message = new Message(msg);

        if (message.isJoinRequest()) {
          rooms.join(message.getRoomID(), message.args[1], ws);
          ws.send(PROTOCOL.JOINED + PROTOCOL.SEPARATOR + "1"); //FIX
        } else if (message.isCreateRequest()) {
          const id = rooms.create(message.getUser());
          ws.send(PROTOCOL.CREATED + PROTOCOL.SEPARATOR + id);
        } else if (message.isControlRequest()) {
          let roomID = rooms.getRoomID(ws);
          console.log("server: host dio play");
          console.log(roomID);
          rooms.getUsers(roomID).forEach((user) => {
            console.log(message.cmd);
            user.socket.send(message.cmd);
          });
        }
      });
    });
    wss.on("close", () => {
      //Do some cleanup here
    });
  };

  /* TO DO: Notify chat message
  sockets.notifyAll = (data) => {
    for (let ws of clients) {
      ws.send(data);
    }
  };
  */

  return sockets;
};

module.exports = Sockets();
