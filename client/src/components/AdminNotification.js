/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-else-return */
import React from 'react';
import '../stylesheets/AdminNotifications.css';
import {
  Button,
} from 'react-bootstrap';

const lib = require('../api/fetchers');

function AdminNotification(props) {
  const { note, group } = props;

  function handleJoinRequest(e) {
    const action = e.currentTarget.textContent;
    if (action === 'Deny') {
      const data = { groupId: group.group.idGroups, userId: note.idUser_Action, approve: 0 };
      lib.resolveJoinRequest(data, note.idAdminNotifications);
      document.getElementById('approve').style.display = 'none';
      document.getElementById('deny').style.display = 'none';
    } else if (action === 'Approve') {
      const data = { groupId: group.group.idGroups, userId: note.idUser_Action, approve: 1 };
      lib.resolveJoinRequest(data, note.idAdminNotifications);
      document.getElementById('approve').style.display = 'none';
      document.getElementById('deny').style.display = 'none';
    }
  }

  function handleFlagRequest() {

  }

  function handleView() {
    // update read to 1
    return 1;
  }

  if (note.type === 'leave') {
    return (
      <div className="adminNotification">
        {note.action}
        {note.read_status === 0 && <Button onClick={handleView}>Viewed</Button>}
      </div>
    );
  } else if (note.type === 'join') {
    return (
      <div className="adminNotification">
        {note.action}
        {note.read_status === 0 && <Button id="approve" onClick={handleJoinRequest}>Approve</Button>}
        {note.read_status === 0 && <Button id="deny" onClick={handleJoinRequest}>Deny</Button>}
      </div>
    );
  }
  return (
    <div className="adminNotification">
      {note.action}
      {note.read_status === 0 && <Button onClick={handleFlagRequest}>View</Button>}
    </div>
  );
}

export default AdminNotification;
