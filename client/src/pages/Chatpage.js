/* eslint-disable */
import { React, useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import '../stylesheets/Chatpage.css';
import Chat from '../components/Chat';
import ChatMessage from '../components/ChatMessage';
import { ImageFill, CameraVideoFill, FileEarmarkMusicFill } from 'react-bootstrap-icons';
import { fetchChatsGroups, fetchChatMessages, addChatMessage, getFriends } from '../api/fetchers';
const axios = require('axios');

require('dotenv').config();

function Chatpage(props) {

  let { friendId } = props.match.params;
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState('');
  const [file, setFile] = useState();
  const [type, setType] = useState();
  const curId = localStorage.getItem('currUser');


  useEffect(async () => {

    if (!friendId) {
      const friendRes = await getFriends(curId, -1);
      if (friendRes.data.length !== 0) {
        friendId = friendRes.data[0].idUsers;
      } else {
        friendId = -1;
      }
    }

    const chatRes = await fetchChatsGroups(curId, friendId);
    setChats(chatRes.data);

    let curChatsGroupId;
    // find the chatsGroupId of that friend
    for (const c of chatRes.data) {
      if (c.userTalkTo.idUsers === Number(friendId)) curChatsGroupId = c.chatsGroupId;
    }
    const messageRes = await fetchChatMessages(curChatsGroupId);
    setMessages(messageRes.data);
    setIsLoading(false);
    setSelectedChat(curChatsGroupId);
  }, [friendId]);

  const handleUpLoad = async () => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ml_default');
    data.append('cloud_name', 'cis557-project');
    if (type === 'image') {
      data.append('resource_type', 'image');
    } else if (type === 'video') {
      data.append('resource_type', 'video');
    } else {
      data.append('resource_type', 'audio');
    }
    const res = await axios.post(
      process.env.REACT_APP_cloudinary_upload, data,
    );
    document.getElementById('chat-page-input-body').style.display = 'flex';
    document.getElementById('chatUploadImg').style.display = 'none';
    document.getElementById('chatUploadVideo').style.display = 'none';
    document.getElementById('chatUploadAudio').style.display = 'none';
    return res;
  };

  const sendMessage = async () => {
    const content = document.getElementById('chat-page-input-body').value;
    document.getElementById('chat-page-input-body').value = '';

    let attachment = '';
    if (file !== undefined) {
      const res = await handleUpLoad(file);
      if (res.status === 200) {
        attachment = res.data.secure_url;
      } else {
        return;
      }
    }

    await addChatMessage(selectedChat, curId, content, attachment);

    // re fetch the messages
    const messageRes = await fetchChatMessages(selectedChat);
    setMessages(messageRes.data);
  }

  const imgUploadHandler = () => {
    const imgFile = document.getElementById('chat-page-imgBtn').files[0];
    const url = URL.createObjectURL(imgFile);
    document.getElementById('chatUploadImg').style.display = 'flex';
    document.getElementById('chat-page-input-body').style.display = 'none';
    document.getElementById('chatUploadImg').src = url;
    setFile(imgFile);
    setType('image');
  };

  const videoUploadHandler = () => {
    const videoFile = document.getElementById('chat-page-videoBtn').files[0];
    const url = URL.createObjectURL(videoFile);
    document.getElementById('chatUploadVideo').style.display = 'flex';
    document.getElementById('chat-page-input-body').style.display = 'none';
    document.getElementById('chatUploadVideo').src = url;
    setFile(videoFile);
    setType('video');
  };

  const audioUploadHandler = () => {
    const audioFile = document.getElementById('chat-page-audioBtn').files[0];
    const url = URL.createObjectURL(audioFile);
    document.getElementById('chatUploadAudio').style.display = 'flex';
    document.getElementById('chat-page-input-body').style.display = 'none';
    document.getElementById('chatUploadAudio').src = url;
    setFile(audioFile);
    setType('audio');
  };

  return (
    !isLoading
    && (
      <div className="chat-page-all">
        <NavBar isLogin={0} />
        <div className="chat-home">
          <div className="chat-list-side">
            <div className="chat-list">
              {chats.map((c) => (
                <Chat
                  id={c.userTalkTo.idUsers}
                  src={c.userTalkTo.profilePhoto}
                  name={c.userTalkTo.username}
                  latestMessage={'this is a test latest message'}
                  chosen={friendId}
                />
              ))}
            </div>
          </div>
          <div className="chat-detail">
            <div className="messages">
              {messages.map((m) => (
                <ChatMessage
                  message={m.message}
                  author={m.idUser}
                  curUser={Number(curId)}
                  attachment={m.attachment}
                />
              ))
              }
            </div>
            <div className="chat-input">
              <div className="chat-page-input-types">
                <label htmlFor="chat-page-imgBtn">
                  <ImageFill className="chat-page-input-icons" color="grey" size={30} style={{ cursor: 'pointer' }} />
                  <input type="file" id="chat-page-imgBtn" accept="image/*" style={{ display: 'none' }} onChange={imgUploadHandler} />
                </label>
                <label htmlFor="chat-page-videoBtn">
                  <CameraVideoFill className="chat-page-input-icons" color="grey" size={30} style={{ cursor: 'pointer' }} />
                  <input type="file" id="chat-page-videoBtn" accept="video/*" style={{ display: 'none' }} onChange={videoUploadHandler} />
                </label>
                <label htmlFor="chat-page-audioBtn">
                  <FileEarmarkMusicFill className="chat-page-input-icons" color="grey" size={30} style={{ cursor: 'pointer' }} />
                  <input type="file" id="chat-page-audioBtn" accept="audio/*" style={{ display: 'none' }} onChange={audioUploadHandler} />
                </label>
              </div>
              <div id="chatPostAttatchments">
                <img src="" alt="" style={{ display: 'none', marginRight: '1%' }} id="chatUploadImg" />
                <video controls src="" style={{ display: 'none', marginRight: '1%' }} id="chatUploadVideo">
                  <track default kind="captions" />
                </video>
                <audio controls src="" style={{ display: 'none', marginRight: '1%' }} id="chatUploadAudio">
                  <track default kind="captions" />
                </audio>
              </div>
              <textarea id="chat-page-input-body" cols="30" rows="10" />
              <button id="send-message" type="button" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default Chatpage;