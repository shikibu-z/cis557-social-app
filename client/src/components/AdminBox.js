/* eslint-disable import/no-named-as-default */
/* eslint-disable react/jsx-no-bind */
import { React, useEffect, useState } from 'react';
import {
  Card, Button, ListGroup,
} from 'react-bootstrap';
import InviteUser from './InviteUser';

const lib = require('../api/fetchers');

function AdminBox(props) {
  const { group } = props;
  const [modalShow, setModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState([]);

  async function handleRemoveAdmin(e) {
    const adminId = Number(e.target.getAttribute('data-index'));
    const res = await lib.removeAdmin({ userId: adminId, groupId: group });
    if (res.status === 201) {
      const filteredArray = admins.filter((obj) => obj.userId !== adminId);
      setAdmins(filteredArray);
      window.location.reload();
    }
  }

  useEffect(async () => {
    const res = await lib.getAdmins(group);
    setAdmins(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {

  }, [admins]);

  function renderAdmins() {
    const mapRows = admins.map((a) => (
      <ListGroup.Item key={a.idUsers} className="d-flex justify-content-between">
        <div>
          <img id="invite-user-photo" src={a.profilePhoto} alt="" />
          {a.username}
        </div>
        {a.role === 'admin'
        && (
        <Button data-index={a.idUsers} onClick={handleRemoveAdmin}>
          Remove
        </Button>
        )}
      </ListGroup.Item>
    ));
    return mapRows;
  }

  return (
    !isLoading
    && (
    <div className="GroupInfo">
      <Card style={{
        width: '21rem',
        height: '50rem',
        backgroundColor: '#C4C4C4',
      }}
      >
        <Card.Header style={{
          backgroundColor: 'black',
          textAlign: 'center',
          fontFamily: 'Roboto',
          fontSize: '1.5em',
          color: 'white',
        }}
        >Administrators
        </Card.Header>
        <Card.Body>
          <Button onClick={() => setModalShow(true)}>Add Administrators</Button>
          <ListGroup>
            {renderAdmins()}
          </ListGroup>
        </Card.Body>
      </Card>
      <InviteUser
        show={modalShow}
        onHide={() => setModalShow(false)}
        type="Add"
        group={group}
      />
    </div>
    )
  );
}

export default AdminBox;
