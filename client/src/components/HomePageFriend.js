import React from 'react';
import '../stylesheets/HomePageFriend.css';
import {
  Link,
} from 'react-router-dom';

function HomePageFriend(props) {
  const { id, src, name } = props;

  return (
    <Link style={{ textDecoration: 'none', color: 'black' }} to={`/chat/${id}`}>
      <div className="homepage-friend">
        <img src={src} alt="" />
        <h2>{name}</h2>
      </div>
    </Link>
  );
}

export default HomePageFriend;
