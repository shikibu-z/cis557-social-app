/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { Modal, ListGroup, Button } from 'react-bootstrap';
import '../stylesheets/InviteUser.css';

const lib = require('../api/fetchers');

function InviteUser(props) {
  const id = Number(localStorage.getItem('currUser'));
  const { type, group } = props;
  const [members, setMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);
  const [memberQuery, setMemberQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  function handleAddMember(e) {
    const user = Number(e.target.getAttribute('data-index'));
    if (type === 'Add') {
      lib.addAdmin({ groupId: group, userId: user }).then(() => {
        const filteredArray = originalMembers.filter((obj) => obj.idUsers !== user);
        setOriginalMembers(filteredArray);
      });
    } else {
      lib.inviteUser({ senderId: id, receiverId: user, groupId: group });
      const filteredArray = originalMembers.filter((obj) => obj.idUsers !== user);
      setOriginalMembers(filteredArray);
    }
  }

  function renderMembers() {
    const mapRows = members.map((m) => (
      <ListGroup.Item key={m.idUsers} className="d-flex justify-content-between">
        <div>
          <img id="invite-user-photo" src={m.profilePhoto} alt="" />
          {m.username}
        </div>
        <Button data-index={m.idUsers} onClick={handleAddMember}>
          {type}
        </Button>
      </ListGroup.Item>
    ));
    return mapRows;
  }

  useEffect(() => {
    setMemberQuery('');
    setMembers(originalMembers);
  }, [originalMembers]);

  useEffect(async () => {
    let data = [];
    if (type === 'Add') {
      const res = await lib.getGroupMembers(group);
      const res1 = await lib.getAdmins(group);
      const admins = res1.data.map((a) => a.idUsers);
      for (const mem of res.data) {
        if (!admins.includes(mem.idUsers)) {
          data.push(mem);
        }
      }
    } else {
      const res = await lib.getFriends(id, group);
      if (res.status === 200) {
        data = res.data;
      }
    }
    setMembers(data);
    setOriginalMembers(data);
    setIsLoading(false);
  }, []);

  const handleFilterMembers = (event) => {
    const query = event.target.value;
    if (query !== '') {
      const result = originalMembers.filter(
        (m) => m.username.toLowerCase().startsWith(query.toLowerCase()),
      );
      setMembers(result);
    } else {
      setMembers(originalMembers);
    }
    setMemberQuery(query);
  };

  return (
    !isLoading
    && (
    <Modal {...props}>
      <Modal.Header closeButton />
      <Modal.Body>
        <input id="invite-friend-search" placeholder="Search a friend" value={memberQuery} onChange={handleFilterMembers} />
        <ListGroup>
          {renderMembers()}
        </ListGroup>
      </Modal.Body>
    </Modal>
    )
  );
}

export default InviteUser;
