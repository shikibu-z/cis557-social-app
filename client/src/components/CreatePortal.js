/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { CameraVideoFill, CardImage, FileEarmarkMusicFill } from 'react-bootstrap-icons';
import { MentionsInput, Mention } from 'react-mentions';
import PostDialog from './PostDialog';
import '../stylesheets/CreatePortal.css';
import '../stylesheets/Mention.css';

import { getGroupMembers, addPost, mentionUser } from '../api/fetchers';

require('dotenv').config();

const axios = require('axios');

function Popup(props) {
  const { groupid } = props;
  const id = localStorage.getItem('currUser');
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState();
  const [type, setType] = useState();
  const [content, setContent] = useState('');
  const [mentionuser, setMention] = useState([]);

  useEffect(async () => {
    const fetchdata = await getGroupMembers(groupid);
    const newUsers = fetchdata.data.map((user) => (
      {
        id: `${user.idUsers}`,
        display: user.username,
      }
    ));
    setUsers(newUsers);
  }, []);

  const togglePopup = () => {
    setMention([]);
    setContent('');
    setIsOpen(!isOpen);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleAddMention = (e) => {
    mentionuser.push(e);
    setMention(mentionuser);
  };

  const transform = (displayid, display) => `@${display}`;

  const imgUploadHandler = () => {
    const imgFile = document.getElementById('imgBtn').files[0];
    const url = URL.createObjectURL(imgFile);
    document.getElementById('uploadImg').style.display = 'flex';
    document.getElementById('uploadImg').src = url;
    setFile(imgFile);
    setType('image');
  };

  const videoUploadHandler = () => {
    const videoFile = document.getElementById('videoBtn').files[0];
    const url = URL.createObjectURL(videoFile);
    document.getElementById('uploadVideo').style.display = 'flex';
    document.getElementById('uploadVideo').src = url;
    setFile(videoFile);
    setType('video');
  };

  const audioUploadHandler = () => {
    const audioFile = document.getElementById('audioBtn').files[0];
    const url = URL.createObjectURL(audioFile);
    document.getElementById('uploadAudio').style.display = 'flex';
    document.getElementById('uploadAudio').src = url;
    setFile(audioFile);
    setType('audio');
  };

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
    return res;
  };

  const submitPost = async (e) => {
    e.preventDefault();
    let url = '';
    const postContent = document.getElementById('inputPostContent').value;
    const postTitle = document.getElementById('inputPostTitle').value;
    if (postTitle !== '' && postContent !== '') {
      if (file !== undefined) {
        const res = await handleUpLoad(file);
        if (res.status === 200) {
          url = res.data.secure_url;
        } else {
          return;
        }
      }
      const postData = {
        userId: id,
        groupId: groupid,
        flagged: 0,
        title: postTitle,
        content: postContent,
        attachment: url,
      };

      mentionuser.forEach((receiver) => {
        mentionUser(id, receiver, groupid);
      });
      setMention([]);
      addPost(groupid, postData).then(() => {
        window.location.reload();
      });
      setContent('');
    }
  };

  return (
    <div>
      <Button id="createBtn" style={{ backgroundColor: '#F8B114', border: 'none' }} onClick={togglePopup}>Create A Post</Button>
      {isOpen && (
        <PostDialog
          content={(
            <div id="postSubmitPage">
              <form id="submitPostForm">
                <div id="postPopupHeader">Submit a Post</div>
                <input id="inputPostTitle" placeholder="Enter a title" required="Title can not be empty" />
                <div id="postTypeContainer">
                  <label htmlFor="imgBtn">
                    <CardImage size={24} style={{ cursor: 'pointer' }} />
                    <input type="file" id="imgBtn" accept="image/*" style={{ display: 'none' }} onChange={imgUploadHandler} />
                  </label>
                  <label htmlFor="videoBtn">
                    <CameraVideoFill size={24} style={{ cursor: 'pointer' }} />
                    <input type="file" id="videoBtn" accept="video/*" style={{ display: 'none' }} onChange={videoUploadHandler} />
                  </label>
                  <label htmlFor="audioBtn">
                    <FileEarmarkMusicFill size={24} style={{ cursor: 'pointer' }} />
                    <input type="file" id="audioBtn" accept="audio/*" style={{ display: 'none' }} onChange={audioUploadHandler} />
                  </label>
                </div>
                <div id="postAttatchments">
                  <img src="" alt="" style={{ display: 'none', marginRight: '1%' }} id="uploadImg" />
                  <video controls src="" style={{ display: 'none', marginRight: '1%' }} id="uploadVideo">
                    <track default kind="captions" />
                  </video>
                  <audio controls src="" style={{ display: 'none', marginRight: '1%' }} id="uploadAudio">
                    <track default kind="captions" />
                  </audio>
                </div>
                <MentionsInput
                  markup="@{{__idUsers__||__username__}}"
                  value={content}
                  onChange={handleContentChange}
                  className="mentions"
                  id="inputPostContent"
                >
                  <Mention
                    trigger="@"
                    data={users}
                    className="mentions-mention"
                    displayTransform={transform}
                    required="Enter comments"
                    onAdd={handleAddMention}
                  />
                </MentionsInput>
                <div className="postBtnWrapper">
                  <Button id="cancelBtn" type="button" onClick={togglePopup}>Cancel</Button>
                  <Button id="postBtn" type="submit" onClick={submitPost}>Post</Button>
                </div>
              </form>
            </div>
          )}
          handleClose={togglePopup}
        />
      )}
    </div>
  );
}

export default Popup;
