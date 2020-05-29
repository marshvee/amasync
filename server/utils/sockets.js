const WebSocket = require("ws");
const rooms = require("./rooms");

const PROTOCOL = {
  JOIN: "join",
  CREATE: "create",
  CREATED: "created",
  HOST_TIME: "hosttime",
  JOINED: "joined",
  MOVE: "move",
  PLAY: "play",
  PAUSE: "pause",
  RESTART: "restart",
  SEPARATOR: " ",
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
      return this.args[1];
    } else if (this.isHostTimeRequest()) {
      return this.args[0];
    }
    throw Error(`Message is not JOIN ${this.cmd}: ${this.args}`);
  }

  isCreateRequest() {
    return this.cmd === PROTOCOL.CREATE;
  }
  getUser() {
    if (this.isCreateRequest() || this.isJoinRequest()) {
      return this.args[0];
    }
    throw Error(`Message is not CREATE ${this.cmd}: ${this.args}`);
  }

  isControlRequest() {
    return (
      this.cmd === PROTOCOL.PLAY ||
      this.cmd === PROTOCOL.PAUSE ||
      this.cmd === PROTOCOL.MOVE
    );
  }
  isMoveRequest() {
    return this.cmd === PROTOCOL.MOVE;
  }

  getTime() {
    if (this.isCreateRequest() || this.isHostTimeRequest()) {
      return this.args[1];
    } else if (this.isMoveRequest()) {
      return this.args[0];
    }
    throw Error(`Message is not CREATE ${this.cmd}: ${this.args}`);
  }

  isRestartRequest() {
    return this.cmd === PROTOCOL.RESTART;
  }
  isHostTimeRequest() {
    return this.cmd === PROTOCOL.HOST_TIME;
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
          rooms.join(message.getRoomID(), message.getUser(), ws);
          ws.send(PROTOCOL.JOINED + PROTOCOL.SEPARATOR + message.getRoomID());
        } else if (message.isCreateRequest()) {
          const name = message.getUser();
          const id = rooms.create(name, ws);
          ws.send(
            PROTOCOL.CREATED +
              PROTOCOL.SEPARATOR +
              id +
              PROTOCOL.SEPARATOR +
              name +
              PROTOCOL.SEPARATOR +
              message.getTime()
          );
        } else if (message.isControlRequest()) {
          let roomID = rooms.getRoomID(ws);
          console.log("server: host dio play");
          console.log(roomID);
          rooms.getUsers(roomID).forEach((user) => {
            console.log(message.cmd);
            if (message.isMoveRequest()) {
              user.socket.send(
                message.cmd + PROTOCOL.SEPARATOR + message.getTime()
              );
            } else {
              user.socket.send(message.cmd);
            }
          });
        } else if (message.isRestartRequest()) {
          console.log("entra restart");
          let roomID = rooms.getRoomID(ws);
          let host = rooms.getHost(roomID);
          host.socket.send(PROTOCOL.RESTART + PROTOCOL.SEPARATOR + roomID);
        } else if (message.isHostTimeRequest()) {
          let roomID = message.getRoomID();
          rooms.getUsers(roomID).forEach((user) => {
            user.socket.send(
              PROTOCOL.MOVE + PROTOCOL.SEPARATOR + message.getTime()
            );
          });
        }
      });
    });
    wss.on("close", () => {
      //Do some cleanup here
    });
  };
  
  // Sería bueno quitar este cógigo comentado


  return sockets;
};

module.exports = Sockets();
