/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable prefer-template */
import React, { useState } from 'react';
import '../stylesheets/Login.css';
import {
  useHistory,
} from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';
import ForgotPassword from '../components/ForgotPassword';

import { userLogin } from '../api/fetchers';

function Login() {
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [forgotPasswordShow, setForgotPasswordShow] = useState(false);
  const history = useHistory();

  const handleLogin = async () => {
    // get user input
    const userInfo = {
      username: document.getElementById('username-input').value,
      password: document.getElementById('password-input').value,
    };

    // check user attempts
    let newAttempt = {
      username: '',
      failure: 0,
      timestamp: 0,
    };
    const oldAttempt = JSON.parse(localStorage.getItem('loginRecord'));
    if (oldAttempt !== null) {
      newAttempt = oldAttempt;
      // * change for time control, 0.5 = half a minute for testing
      if (newAttempt.failure >= 3 && (Date.now() - newAttempt.timestamp) / 60000 <= 0.5) {
        setAlert(true);
        setAlertMessage('Too many failed attempts, try again 30 minutes later');
        return;
      }
    }

    // login endpoint
    const response = await userLogin(userInfo);
    if (response.status === 200) {
      // on login valid
      localStorage.setItem('loginRecord', JSON.stringify(
        {
          username: userInfo.username,
          failure: 0,
          timestamp: Date.now(),
        },
      ));
      localStorage.setItem('currUser', response.data.id);
      history.push('/homepage');
    } else {
      // on invalid
      newAttempt.username = userInfo.username;
      if (newAttempt.failure >= 3) {
        newAttempt.failure = 3;
      } else {
        newAttempt.failure += 1;
      }
      newAttempt.timestamp = Date.now();
      localStorage.setItem('loginRecord', JSON.stringify(newAttempt));
      setAlert(true);
      setAlertMessage('Some information you entered is not correct');
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordShow(false);
  };

  return (
    <div>
      <NavBar isLogin={1} />
      <div className="container d-flex align-items-center flex-column">
        <img id="login-box-logo" src={`${process.env.PUBLIC_URL}Connexion-logos_transparent.png`} alt="connexion" />
        <form className="loginbox container d-flex flex-column">
          {alert && (
            <Alert show={alert} variant="danger">
              {alertMessage}
            </Alert>
          )}
          <div className="form-group">
            <label htmlFor="username-input">
              Username:
              <input type="text" className="form-control" id="username-input" placeholder="Enter username" />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="password-input">
              Password:
              <input type="password" className="form-control" id="password-input" placeholder="Enter password" />
            </label>
          </div>
          <div className="form-group button-group">
            <button className="btn-hide" type="button" onClick={() => setForgotPasswordShow(true)}>forgot password</button>
          </div>
          <div className="form-group button-group">
            <button className="btn right-btn" type="button" onClick={handleLogin}>Login</button>
            <button className="btn right-btn" type="button" onClick={() => history.push('/signup')}>Sign up</button>
          </div>
          <ForgotPassword
            show={forgotPasswordShow}
            onHide={handleCloseForgotPassword}
          />
        </form>
      </div>
    </div>
  );
}

export default Login;
