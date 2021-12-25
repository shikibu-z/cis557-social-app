/* eslint-disable react/jsx-no-bind */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MentionsInput, Mention } from 'react-mentions';
import { withRouter, useHistory } from 'react-router';
import NavBar from '../components/NavBar';
import GroupInfo from '../components/GroupInfo';
import GroupHeader from '../components/GroupHeader';
import '../stylesheets/SpecificPost.css';
import '../stylesheets/Mention.css';
import CommentDetail from '../components/CommentDetail';

import {
  getGroupInfo,
  getPostById,
  fetchUserProfile,
  getCommentsOfPost,
  getGroupMembers,
  postComment,
  hideOrFlagPost,
  deletePost,
  mentionUser,
} from '../api/fetchers';

function SpecificPost() {
  const userid = localStorage.getItem('currUser');
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState();
  const [author, setAuthor] = useState();
  const [comments, setComments] = useState();
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState('');
  const [admin, setAdmin] = useState(false);
  const [post, setPost] = useState();
  const [mediaType, setMediaType] = useState();
  const [mentionuser, setMention] = useState([]);
  const single = true;
  const mediaTypes = {
    jpg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    '3gp': 'video',
    mp3: 'audio',
    ogg: 'audio',
  };

  function getMediaType(url) {
    const extension = url.split('.').pop();
    if (extension in mediaTypes) {
      return mediaTypes[extension];
    }
    return 'none';
  }

  function formatDate(d) {
    const m = (d.getMonth() + 1).toString();
    const day = d.getDate().toString();
    const y = d.getFullYear().toString();
    const h = d.getHours().toString();
    const min = d.getMinutes().toString();
    const s = d.getSeconds().toString();
    const res = m + '-' + day + '-' + y + ' ' + h + ':' + min + ':' + s;
    return res;
  }

  function transform(id, display) {
    return '@' + display;
  }

  useEffect(async () => {
    const groupid = window.location.href.split('/').slice(-2)[0];
    const postid = window.location.href.split('/').pop();
    const res = await getGroupInfo(userid, groupid);
    setAdmin(res.data.isAdmin);
    setGroup(res.data);
    const postRes = await getPostById(groupid, postid, userid);
    setMediaType(getMediaType(postRes.data.attachment));
    postRes.data.timestamp = formatDate(new Date(postRes.data.timestamp));
    setPost(postRes.data);
    const authorRes = await fetchUserProfile(postRes.data.idUser);
    setAuthor(authorRes.data);
    const commentsRes = await getCommentsOfPost(postRes.data.idGroup,
      postRes.data.idPosts, postRes.data.idUser);
    setComments(commentsRes.data);
    setIsLoading(false);
    const fetchdata = await getGroupMembers(groupid);
    const newUsers = fetchdata.data.map((user) => (
      {
        id: `${user.idUsers}`,
        display: user.username,
      }
    ));
    setUsers(newUsers);
  }, []);

  async function handleComment() {
    const text = document.getElementById('commentInput').value;
    if (text !== '') {
      postComment(post.idGroup, post.idPosts, { userId: userid, content: text });
      mentionuser.forEach((receiver) => {
        mentionUser(userid, receiver, post.idGroup);
      });
      setMention([]);
      setContent('');
      window.location.reload();
    }
  }

  function handleHidePost() {
    hideOrFlagPost(post.idGroup, post.idPosts, { userId: userid, flag: false, hide: true })
      .then(() => {
        history.push(`/explore/${post.idGroup}`);
      });
  }

  function handleDeletePost() {
    deletePost(post.idGroup, post.idPosts, userid).then(() => {
      history.push(`/explore/${post.idGroup}`);
    });
  }

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleAddMention = (e) => {
    mentionuser.push(e);
    setMention(mentionuser);
  };

  return (
    !isLoading
    && (
      <div>
        <NavBar isLogin={0} />
        <div id="specificPostContainer">
          <div id="ghWrapper">
            <GroupHeader group={group} src={group.group.profilePhoto} join="true" />
          </div>
          <div id="postDetailContainer">
            <div>
              {mediaType === 'video'
                && (
                  <video width="420" height="340" controls>
                    <source src={post.attachment} />
                    <track src="captions_en.vtt" kind="captions" label="english_captions" />
                  </video>
                )}
              {mediaType === 'image'
                && (
                  <img width="420" height="340" src={post.attachment} alt="could not media" />
                )}
              {mediaType === 'audio'
                && (
                  <audio controls>
                    <source src={post.attachment} />
                    <track src="captions_en.vtt" kind="captions" label="english_captions" />
                  </audio>
                )}
            </div>
            <div id="postHeader">
              <div id="postInfo">
                posted by {author.username} at {post.timestamp}
                {userid !== author.userId && <button type="submit" id="hideOption" onClick={handleHidePost}>hide post</button>}
                {(userid === author.userId || admin) && <button type="submit" id="delOption" onClick={handleDeletePost}>delete post</button>}
              </div>
              <div id="postTitle">{post.title}</div>
            </div>
            <div id="postDetail">
              {post.content}
            </div>
          </div>
          <form className="commentForm">
            <div>
              {/* <input id="commentInput" className="commentInput" name="comment"
            placeholder="Enter comment" required="Comment can not be empty" /> */}
              <MentionsInput
                markup="@{{__idUsers__||__username__}}"
                singleLine={single}
                value={content}
                onChange={handleContentChange}
                className="mentions"
                id="commentInput"
                name="comment"
                placeholder="Enter comment"
                required={single}
              >
                <Mention
                  trigger="@"
                  data={users}
                  className="mentions-mention"
                  displayTransform={transform}
                  required={single}
                  onAdd={handleAddMention}
                />
              </MentionsInput>
            </div>
            <div className="btnWrapper">
              <div>
                <Button id="deleteBtn" type="submit" onClick={() => { history.push(`/${group.name}`); }} style={userid !== author.idUser ? { display: 'none' } : { display: 'block' }}>Delete</Button>
              </div>
              <div>
                <Button onClick={handleComment} id="commentBtn">Comment</Button>
              </div>
            </div>
          </form>
          <div className="commentsContainer" id="cc">
            {comments.map((c) => (
              <CommentDetail
                author={c.idUser}
                timestamp={formatDate(new Date(c.timestamp))}
                content={c.content}
                postid={c.idPost}
                commentid={c.idComments}
                groupid={group.group.idGroup}
              />
            ))}
          </div>
        </div>
        <GroupInfo groupInfo={group} />
      </div>
    )
  );
}

export default withRouter(SpecificPost);
