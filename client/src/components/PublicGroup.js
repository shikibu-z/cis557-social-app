/* eslint-disable prefer-template */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable eqeqeq */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable no-await-in-loop */
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import NavBar from './NavBar';
import GroupInfo from './GroupInfo';
import CondensedPost from './CondensedPost';
import InviteUser from './InviteUser';
import '../stylesheets/PublicGroup.css';

const lib = require('../api/fetchers');

function PublicGroup() {
  const id = localStorage.getItem('currUser');
  const [joined, setJoined] = useState();
  const [admin, setAdmin] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [group, setGroup] = useState({});
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(2);
  const [hasMore, sethasMore] = useState(true);

  const groupid = window.location.href.split('/').pop();

  let joinButton;
  let inviteButton;

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

  function requested(notes, user) {
    for (const n of notes) {
      if (n.type === 'join' && n.read_status === 0 && n.idUser_Action === Number(user)) {
        return true;
      }
    }
    return false;
  }

  const handleLeaveGroup = () => {
    lib.leaveGroup(group.group.idGroups, { userId: id }).then(() => {
      setJoined('false');
    });
  };

  const handleJoinGroup = () => {
    lib.joinRequest({ userId: id }, group.group.idGroups).then(() => {
      setJoined('pending');
    });
  };

  useEffect(async () => {
    const res = await lib.getGroupInfo(id, groupid);
    setAdmin(res.data.isAdmin);
    setGroup(res.data);

    // if joined -> show invite, leave button
    // if request pending -> showing pending button
    // if not joined-> show join button
    const notes = await lib.getAdminNotes(groupid);
    if (requested(notes.data, id)) {
      setJoined('pending');
    } else if (res.data.isJoined) {
      setJoined('joined');
    } else {
      setJoined('false');
    }
    // only show posts if user has joined group
    if (res.data.isJoined) {
      const resPosts = await lib.getPosts(groupid, id, 1);
      for (const post of resPosts.data) {
        const author = await lib.fetchUserProfile(post.idUser);
        post.username = author.data.username;
      }
      setPosts(resPosts.data);
    }
    setIsLoading(false);
  }, []);

  const fetchPosts = async () => {
    setTimeout(async () => {
      const res = await lib.getPosts(groupid, id, page);
      if (res.data.length === 0) {
        sethasMore(false);
      } else {
        for (const post of res.data) {
          const author = await lib.fetchUserProfile(post.idUser);
          post.username = author.data.username;
        }
        setPosts([...posts, ...res.data]);
      }
      setPage(page + 1);
    }, 500);
  };

  return (
    !isLoading
    && (
      <div className="public-group">
        <NavBar isLogin={0} />
        <div className="group-content">
          <div className="post-list">
            <div className="group-title">
              <img className="avatar" src={group.group.profilePhoto} alt="" />
              <h2>{group.group.groupName}</h2>
              {joined === 'false' && <button id="join-group" type="button" onClick={handleJoinGroup}>Join</button>}
              {joined === 'joined' && <button id="invite-user" type="button" onClick={() => setModalShow(true)}>Invite</button>}
              {joined === 'joined' && <button id="join-group" type="button" onClick={handleLeaveGroup}>Leave</button>}
              {joined === 'pending' && <button id="join-group" type="button">Pending</button>}
              <InviteUser
                show={modalShow}
                onHide={() => setModalShow(false)}
                type="Invite"
                group={group.group.idGroups}
              />
            </div>
            {posts.length !== 0
              && (
                <InfiniteScroll
                  dataLength={posts.length}
                  next={fetchPosts}
                  hasMore={hasMore}
                  loader={<h4>Loading...</h4>}
                >
                  {posts.map((p) => (
                    <div style={{ marginBottom: '3%' }}>
                      <CondensedPost
                        key={p.idPosts.toString()}
                        group={p.idGroup}
                        title={p.title}
                        info={`Posted by ${p.username} at ${formatDate(new Date(p.timestamp))}`}
                        isFlagged={p.flagged}
                        postid={p.idPosts}
                      />
                    </div>
                  ))}
                </InfiniteScroll>
              )}
          </div>
          <div className="make-post">
            <GroupInfo groupInfo={group} />
          </div>
        </div>
      </div>
    )
  );
}

export default PublicGroup;
