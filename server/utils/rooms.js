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
    console.log(hosts);
    return id;
  };

  Rooms.getUsers = (roomID) => {
    console.log(rooms.get(roomID));
    return rooms.get(roomID).users;
  };

  Rooms.getRoomID = (ws) => {
    console.log(hosts);
    return hosts.get(ws);
  };

  return Rooms;
};

module.exports = Rooms();
