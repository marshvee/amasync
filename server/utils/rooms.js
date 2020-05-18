const uuid = require("uuid");

const Rooms = function () {
  const Rooms = {};
  const rooms = new Map();
  const users = new Map();

  Rooms.join = (roomID, user, ws) => {
    users.set(ws, roomID);
    rooms.get(roomID).users.push({ user: user, socket: ws });
  };

  Rooms.create = (user, ws) => {
    let id = uuid.v4();
    let host = { user: user, socket: ws };
    rooms.set(id, { host: host, users: [] });
    users.set(ws, id);
    return id;
  };

  Rooms.getUsers = (roomID) => {
    return rooms.get(roomID).users;
  };

  Rooms.getHost = (roomID) => {
    console.log(rooms.get(roomID) + "gethost");
    return rooms.get(roomID).host;
  };

  Rooms.getAllUsers = (roomID) => {
    let users = Rooms.getUsers(roomID);
    users.push(Rooms.getHost(roomID));
    return users;
  };

  Rooms.getRoomID = (ws) => {
    return users.get(ws);
  };

  return Rooms;
};

module.exports = Rooms();
