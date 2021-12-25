/* eslint-disable */
import React from 'react';
import '../stylesheets/Chat.css';
import {
  Link,
} from 'react-router-dom';

function Chat(props) {

  let { id, src, name, latestMessage, chosen } = props;

  // truncate too long message
  if (latestMessage.length > 30) {
    latestMessage = latestMessage.substring(0, 30) + "...";
  }

  return (
    <Link key={id} style={{ textDecoration: 'none', color: 'black' }} to={`/chat/${id}`}>
      {id === parseInt(chosen)
        ? <div className="chat-card" style={{ background: 'lightslategrey' }}>
          <img src={src} alt="" />
          <div className="chat-card-content">
            <h2 style={{ color: 'white' }}>{name}</h2>
            {/* <p style={{ color: 'white' }}>{latestMessage}</p> */}
          </div>
        </div>
        : <div className="chat-card">
          <img src={src} alt="" />
          <div className="chat-card-content">
            <h2>{name}</h2>
            {/* <p>{latestMessage}</p> */}
          </div>
        </div>
      }
    </Link>
  );
}

export default Chat;
