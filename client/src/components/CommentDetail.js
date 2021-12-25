/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import '../stylesheets/CommentDetail.css';

const lib = require('../api/fetchers');

function CommentDetail(props) {
  const userid = localStorage.getItem('currUser');
  const [commentAuthor, setCommentAuthor] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const {
    author, timestamp, content, groupid, postid, commentid,
  } = props;

  function handleDeleteComment() {
    lib.deleteComment(groupid, postid, commentid);
    window.location.reload();
  }

  useEffect(async () => {
    const authorRes = await lib.fetchUserProfile(author);
    setCommentAuthor(authorRes.data);
    setIsLoading(false);
  }, []);
  return (
    !isLoading
    && (
    <div className="commentWrapper">
      <img src={commentAuthor.photo} alt="comment user" />
      <div className="commentDetailWrapper">
        <div className="userInfoWrapper">
          <div id="commentUserName">{commentAuthor.username}</div>
          <div id="timeFromNow">{timestamp}</div>
          {userid == author && <button type="submit" id="deleteOption" onClick={handleDeleteComment}>delete</button>}
        </div>
        <div id="commentBody">{content}</div>
      </div>
    </div>
    )
  );
}

export default CommentDetail;
