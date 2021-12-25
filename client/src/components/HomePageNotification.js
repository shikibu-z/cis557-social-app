/* eslint-disable camelcase */
import React from 'react';
import '../stylesheets/HomePageNotification.css';
import {
  Button,
} from 'react-bootstrap';
import {
  resolveJoinNotification, resolveReadNotification,
} from '../api/fetchers';

function HomePageNotification(props) {
  const {
    id, read_status, type, action, idGroup_Action,
  } = props;
  const acceptInviteFunc = async () => {
    const obj = {
      notiId: id,
      userId: Number(localStorage.getItem('currUser')),
      groupId: idGroup_Action,
      approve: true,
    };
    await resolveJoinNotification(obj);
  };

  const declineInviteFunc = async () => {
    const obj = {
      notiId: id,
      userId: Number(localStorage.getItem('currUser')),
      groupId: idGroup_Action,
      approve: false,
    };
    await resolveJoinNotification(obj);
  };

  const readFunc = async () => {
    const obj = {
      notiId: id,
    };
    const userId = Number(localStorage.getItem('currUser'));
    await resolveReadNotification(userId, obj);
  };

  if (type === 'invite') {
    return (
      <div className="notification">
        {action}
        <div>
          {read_status === 0 && <Button onClick={acceptInviteFunc}>accept</Button>}
          {read_status === 0 && <Button onClick={declineInviteFunc}>decline</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="notification">
      {action}
      <div>
        {read_status === 0 && <Button variant="black" onClick={readFunc}>Read</Button>}
      </div>
    </div>
  );
}

export default HomePageNotification;
