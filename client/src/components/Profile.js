import React from 'react';
import {
  Row, Col,
} from 'react-bootstrap';
import '../stylesheets/Profile.css';

function Profile(props) {
  const {
    profileImage, userName, registrationDate, interests, gender, groupsInCommon,
  } = props;

  // list of groups, group[1] = groupname, group[0] = profile photo
  const interestsArray = [];
  for (let i = 0; i < interests.length; i += 1) {
    interestsArray.push(
      <p className="m-md-auto p-1 d-inline-block" key={interests[i]} style={{ 'text-decoration': 'underline' }}>
        {interests[i]}
      </p>,
    );
  }

  const groupsArray = [];
  for (let i = 0; i < groupsInCommon.length; i += 1) {
    groupsArray.push(
      <div key={i} style={{ display: 'inline-block' }}>
        <img alt="" id="profile-group-image" src={groupsInCommon[i][0]} title={groupsInCommon[i][1]} />
      </div>,
    );
  }

  return (
    <div className="profile">
      <img id="profile-avatar" src={profileImage} className="avatar" alt="profile" />
      <p id="profile-username">{userName}</p>
      <div id="profile-info">
        <Row>
          <Col md={2}>
            <div className="bulletpoint" />
          </Col>
          <Col md={10}>
            <p id="profile-gender"><strong>  Gender: </strong>   {gender}</p>
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <div className="bulletpoint" />
          </Col>
          <Col md={10}>
            <p id="profile-registration-date"><strong>  Registration Date: </strong>   {registrationDate}</p>
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <div className="bulletpoint" />
          </Col>
          <Col md={10}>
            <p id="profile-interest"><strong>  Interests: </strong> </p>
          </Col>
        </Row>
        <div className="d-flex flex-row justify-content-between">
          {interestsArray}
        </div>
        <Row>
          <Col md={2}>
            <div className="bulletpoint" />
          </Col>
          <Col md={10}>
            <p><strong>  Groups: </strong> </p>
          </Col>
        </Row>
        <div className="profile-array">
          {groupsArray}
        </div>
      </div>
    </div>
  );
}

export default Profile;
