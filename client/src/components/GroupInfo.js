/* eslint-disable prefer-template */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect } from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Card, Row, Col, Button,
} from 'react-bootstrap';
import CreatePortal from './CreatePortal';

function formatDate(d) {
  const m = (d.getMonth() + 1).toString();
  const day = d.getDate().toString();
  const y = d.getFullYear().toString();
  const res = m + '-' + day + '-' + y;
  return res;
}

function GroupInfo(props) {
  const { groupInfo } = props;

  const online = 5;

  return (
    <div className="GroupInfo">
      <Card style={{
        width: '18rem',
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
        >About {groupInfo.group.groupName}
        </Card.Header>
        <Card.Body>
          <Card.Text>
            {groupInfo.group.groupInfo}
          </Card.Text>
          <Row xs={1} md={2} className="g-4">
            <Col>
              <Card className="text-center" style={{ backgroundColor: '#C4C4C4', border: 'none' }}>
                <Card.Body>
                  <Card.Text>
                    {groupInfo.numOfMembers}
                  </Card.Text>
                  <Card.Title style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Members</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="text-center" style={{ backgroundColor: '#C4C4C4', border: 'none' }}>
                <Card.Body>
                  <Card.Text>
                    {online}
                  </Card.Text>
                  <Card.Title style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Online</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Card className="text-center" style={{ backgroundColor: '#C4C4C4', border: 'none' }}>
            <Card.Text>Created on {formatDate(new Date(groupInfo.group.createDate))}</Card.Text>
          </Card>
          {groupInfo.isJoined && <Card className="text-center" style={{ backgroundColor: '#F8B114' }}>
            <CreatePortal groupid={groupInfo.group.idGroups}> </CreatePortal>
          </Card>}
          {groupInfo.isAdmin && <Link to={`/explore/${groupInfo.group.idGroups}/admin`}>
            <Button style={{
              marginTop: '2%', color: 'white', backgroundColor: 'black', border: 'none', width: '100%',
            }}
            >  Admin Page  </Button></Link>}
        </Card.Body>
      </Card>
    </div>
  );
}

export default GroupInfo;
