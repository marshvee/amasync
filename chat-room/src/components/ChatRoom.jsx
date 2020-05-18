import React, { useState } from "react";

function ChatRoom(props) {
  const [msg, setMsg] = useState("");

  const sendMessage = () => {
    props.sendMessage(msg);
    setMsg("");
  };

  return (
    <div>
      <input id="msg" onChange={(e) => setMsg(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;
