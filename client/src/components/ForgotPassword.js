/* eslint-disable */
import {
  Modal, Form, Alert,
} from 'react-bootstrap';
import React, { useState } from 'react';
import '../stylesheets/ForgotPassword.css';
import loginValidate from '../app/loginValidate';

const lib = require('../api/fetchers');

function ForgotPassword(props) {
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [updated, setUpdated] = useState(false);

  const onUpdate = async () => {
    // retrive user input
    const userInfo = {
      email, username, password, gender: '',
    };

    // validate user input
    const userObject = loginValidate(userInfo);
    if (Object.values(userObject).some((prop) => prop === null)) {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const key in userObject) {
        if (userObject[key] === null) {
          switch (key) {
            case 'email':
              setAlert(true);
              setAlertMessage('Invalid user email!');
              return;
            case 'username':
              setAlert(true);
              setAlertMessage('Invalid username!');
              return;
            case 'password':
              setAlert(true);
              setAlertMessage('Invalid password!');
              return;
            default:
              // no need for anything, there has to be at least one case
              break;
          }
        }
      }
    }

    // reset password endpoint
    const response = await lib.resetPassword(userObject);
    if (response.status === 200) {
      setUpdated(true);
    } else {
      setAlert(true);
      setAlertMessage('Provided email and username does not match');
    }
  };

  const { show, onHide } = props;
  const onClose = () => {
    setUpdated(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton />
      <Modal.Body>
        {!updated ? (
          <Form>
            {alert && (
              <Alert show={alert} variant="danger">
                {alertMessage}
              </Alert>
            )}
            <Form.Group>
              <Form.Label>Email address</Form.Label>
              <Form.Control className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Form.Label>Username</Form.Label>
              <Form.Control className="form-input" type="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Form.Label>New password</Form.Label>
              <Form.Control className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <div className="button-group">
              <button className="btn" type="button" onClick={onUpdate}>
                Update
              </button>
            </div>
          </Form>
        ) : (
          <p style={
            {
              'text-align': 'center', fontSize: 20, width: '280px', height: '140px',
            }
          }
          >Password updated
          </p>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ForgotPassword;
