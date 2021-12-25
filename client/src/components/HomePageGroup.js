import React from 'react';
import '../stylesheets/HomePageGroup.css';
import {
  Link,
} from 'react-router-dom';

function HomePageGroup(props) {
  const {
    id, src, groupName, groupInfo, members, priv, join,
  } = props;

  let isPrivate = 'No';
  let isJoined = 'No';
  if (priv === 1) {
    isPrivate = 'Yes';
  }
  if (join === 'true') {
    isJoined = 'Yes';
  }

  return (
    <Link key={id} style={{ textDecoration: 'none', color: 'black' }} to={`/explore/${id}`}>
      <div className="homepage-group">
        <img src={src} alt="" />
        <div className="homepage-group-name">
          <h2>{groupName}</h2>
          <p className="homepage-group-info">
            {groupInfo}
          </p>
          <p className="homepage-group-members">
            Private: {isPrivate}
            {' '}
            Joined: {isJoined}
            {' '}
            Members: {members}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default HomePageGroup;
