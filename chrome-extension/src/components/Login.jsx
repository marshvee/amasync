import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errorO, setError] = useState(false);

  const handleSubmit = () => {
    let user = { username, password };
    postData("/login", user)
      .then((data) => {
        if (data.error) {
          //contraseña
          setError(true);
        } else {
          props.setUser(data.user);
          props.enter();
          setError(false);
        }
      })
      .catch((err) => {
        setError(true);
      });
  };

  return (
    <>
      {errorO ? (
        <Alert variant="danger" onClose={() => setError(false)} dismissible>
          <Alert.Heading>Username or password is wrong.</Alert.Heading>
        </Alert>
      ) : (
        <></>
      )}

      <Form>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Row>
            <Form.Control
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Row>
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Row>
            <Form.Control
              type="password"
              placeholder="Password"
              className=" ml-sm-2"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Row>
        </Form.Group>
        <Button variant="primary" className=" ml-sm-2" onClick={handleSubmit}>
          Login
        </Button>
      </Form>
    </>
  );
  /* El código de está parte se ecnuentra muy bien comentado al igual que el de los otros componentes*/
  
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
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    if (response.ok) {
      return response.json(); // parses JSON response into native JavaScript objects
    } else {
      throw new Error("Usuario incorrecto");
    }
  }
}
export default Login;
