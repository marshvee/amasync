import React, { useState } from "react";
import { Col, Form, Button } from "react-bootstrap";

//Método para hacer post con fetch
async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch("https://amasync.tk:8080" + url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "include", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function Register(props) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    let user = {
      user: { username, name, password },
    };
    console.log(user);
    postData("/user/new", user).then((data) => {
      if (data.error) {
        //avisar al usuario del error
      } else {
        user = { username, password };
        postData("/login", user).then((data) => props.setUser(data.user));
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formGridUsername">
        <Form.Label>Email</Form.Label>
        <Form.Row>
          <Form.Control
            required
            type="email"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Row>
      </Form.Group>

      <Form.Group controlId="formGridPassword">
        <Form.Label>Password</Form.Label>
        <Form.Row>
          <Form.Control
            required
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Row>
      </Form.Group>

      <Form.Group controlId="formGridName">
        <Form.Label>Name</Form.Label>
        <Form.Row>
          <Form.Control
            required
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Row>
      </Form.Group>
      <Button variant="primary" type="submit">
        Register
      </Button>
    </Form>
  );
}
export default Register;
