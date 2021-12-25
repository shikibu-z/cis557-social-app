/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import '../stylesheets/GroupHeader.css';
import InviteUser from './InviteUser';

const lib = require('../api/fetchers');

function GroupHeader(props) {
  const id = localStorage.getItem('currUser');
  const { src, group } = props;
  const status = 'Leave';
  const [modalShow, setModalShow] = useState(false);
  const history = useHistory();

  function handleLeave() {
    lib.leaveGroup(group.group.idGroups, { userId: id }).then(() => {
      history.push('/homepage');
    });
  }

  return (
    <div className="groupHeaderWrapper">
      <img src={src} alt="group-img" />
      <div id="groupNameWrapper">
        {group.group.groupName}
      </div>
      <div>
        <button id="inviteBtn" type="button" onClick={() => setModalShow(true)}>Invite</button>
      </div>
      <div id="groupBtnWrapper">
        <button id="joinLeaveBtn" type="submit" onClick={handleLeave}>{status}</button>
      </div>
      <InviteUser
        show={modalShow}
        onHide={() => setModalShow(false)}
        type="Invite"
        group={group.group.idGroups}
      />
    </div>
  );
}

export default GroupHeader;
