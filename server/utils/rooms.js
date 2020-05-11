const uuid = require("uuid");

const Rooms = function () {
  const Rooms = {};
  const rooms = new Map();
  let hosts = new Map();

  Rooms.join = (roomID, user, ws) => {
    rooms.get(roomID).users.push({ user: user, socket: ws });
  };

  Rooms.create = (user, ws) => {
    let id = uuid.v4();
    let host = { user: user, socket: ws };
    rooms.set(id, { host: host, users: [] });
    hosts.set(ws, id);
    return id;
  };

  Rooms.getUsers = (roomID) => {
    return rooms.get(roomID).users;
  };

  Rooms.getRoomID = (ws) => {
    return hosts.get(ws);
  };

  return Rooms;
};

module.exports = Rooms();
