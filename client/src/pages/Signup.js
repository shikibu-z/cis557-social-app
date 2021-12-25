import React, { useState } from 'react';
import '../stylesheets/Signup.css';
import {
  useHistory,
} from 'react-router-dom';
import {
  Alert, Modal,
} from 'react-bootstrap';
import NavBar from '../components/NavBar';
import loginValidate from '../app/loginValidate';

import { userRegister } from '../api/fetchers';

function Signup() {
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const history = useHistory();

  const handleSignUp = async () => {
    // SignUpLogic get all user input
    const email = document.getElementById('create-email-input').value;
    const username = document.getElementById('create-username-input').value;
    const password = document.getElementById('create-password-input').value;
    const female = document.getElementById('flexRadioDefault1').checked;
    const male = document.getElementById('flexRadioDefault2').checked;
    const neutral = document.getElementById('flexRadioDefault3').checked;
    let gender = '';
    if (female) {
      [gender] = Object.keys({ female });
    } else if (male) {
      [gender] = Object.keys({ male });
    } else if (neutral) {
      [gender] = Object.keys({ neutral });
    }
    const userInfo = {
      email, username, password, gender,
    };

    // validate user input format
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

    // login endpoint
    const response = await userRegister(userObject);
    if (response.status === 201) {
      // if success,
      setModalShow(true);
      history.push('/login');
    } else {
      setAlert(true);
      setAlertMessage('Email or username already exists!');
    }
  };

  return (
    <div>
      <NavBar isLogin={1} />
      <div className="container container d-flex align-items-center flex-column">
        <img id="login-box-logo" src={`${process.env.PUBLIC_URL}Connexion-logos_transparent.png`} alt="connexion" />
        <form className="signupbox container d-flex flex-column">
          {alert && (
            <Alert show={alert} variant="danger">
              {alertMessage}
            </Alert>
          )}
          <div className="form-group">
            <label htmlFor="create-email-input">
              Enter your Email address
              <input type="email" className="form-control" id="create-email-input" placeholder="Enter email" />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="create-username-input">
              Create a Username:
              <input type="text" className="form-control" id="create-username-input" placeholder="Enter username" />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="create-password-input">
              Create a Password:
              <div>
                <p style={{ 'font-size': '10px', margin: 0 }}>
                  Passwords must contain:
                </p>
                <p style={{ fontSize: '10px', margin: 0 }}>
                  * at least 1 numeric character
                </p>
                <p style={{ fontSize: '10px', margin: 0 }}>
                  * at least 1 lower case character
                </p>
                <p style={{ fontSize: '10px', margin: 0 }}>
                  * at least 1 upper case character
                </p>
                <p style={{ fontSize: '10px', margin: 0 }}>
                  * at least 1 special character
                </p>
                <p style={{ fontSize: '10px', margin: '0 0 0 1' }}>
                  * and between 8 to 15 characters
                </p>
              </div>
              <input type="password" className="form-control" id="create-password-input" placeholder="Enter password" />
            </label>
          </div>
          <div className="form-group">
            <p id="create-gender-input-label">
              Gender
            </p>
            <div className="form-check">
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                Female (She/Her/Hers)
                <input className="form-check-input" type="radio" name="gender-radio" id="flexRadioDefault1" />
              </label>
            </div>
            <div className="form-check">
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                Male (He/Him/His)
                <input className="form-check-input" type="radio" name="gender-radio" id="flexRadioDefault2" />
              </label>
            </div>
            <div className="form-check">
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                Neutral (They/Them/Their)
                <input className="form-check-input" type="radio" name="gender-radio" id="flexRadioDefault3" />
              </label>
            </div>
          </div>
          <div className="form-group cancel-create-buttons">
            <button className="btn right-btn" type="button" onClick={() => { history.push('/login'); }}>Cancel</button>
            <button className="btn right-btn" type="button" onClick={handleSignUp}>Create</button>
          </div>
          {modalShow && (
            <Modal show={modalShow} onHide={() => setModalShow(false)}>
              <Modal.Header closeButton />
              <Modal.Body>
                <h2 style={{ 'text-align': 'center', width: '280px', height: '140px' }}>Successful Registration!</h2>
              </Modal.Body>
            </Modal>
          )}
        </form>
      </div>
    </div>
  );
}

export default Signup;
