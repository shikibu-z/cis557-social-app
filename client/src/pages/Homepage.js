/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
import { React, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../stylesheets/Homepage.css';
import HomePageGroup from '../components/HomePageGroup';
import HomePageFriend from '../components/HomePageFriend';
import HomePageNotification from '../components/HomePageNotification';

import { fetchUserGroups, getFriends, getNotifications } from '../api/fetchers';

function Homepage() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);

  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const id = localStorage.getItem('currUser');

  const [groupQuery, setGroupQuery] = useState('');
  const [friendQuery, setFriendsQuery] = useState('');

  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);

  useEffect(async () => {
    const res = await fetchUserGroups(id);
    setGroups(res.data);
    setFilteredGroups(res.data);

    const friendRes = await getFriends(id, -1);
    setFriends(friendRes.data);
    setFilteredFriends(friendRes.data);
    setIsLoading(false);

    const notificationRes = await getNotifications(id);
    const unread = notificationRes.data.filter((n) => {
      return n.read_status === 0;
    });
    const read = notificationRes.data.filter((n) => {
      return n.read_status === 1;
    });
    setUnreadNotifications(unread);
    setReadNotifications(read);
  }, []);

  // search while typing
  const handleFilterGroups = (e) => {
    const query = e.target.value;
    if (query !== '') {
      const res = groups.filter((group) => {
        return group.groupName.toLowerCase().startsWith(query.toLowerCase());
      });
      setFilteredGroups(res);
    } else {
      setFilteredGroups(groups);
    }
    setGroupQuery(query);
  };

  const handleFilterFriends = (e) => {
    const query = e.target.value;
    if (query !== '') {
      const res = friends.filter((f) => {
        return f.username.toLowerCase().startsWith(query.toLowerCase());
      });
      setFilteredFriends(res);
    } else {
      setFilteredFriends(friends);
    }
    setFriendsQuery(query);
  };

  const history = useHistory();
  return (
    !isLoading
    && (
      <div>
        <NavBar isLogin={0} />
        <div className="home">
          <div className="leftSide">
            <div className="notificationSide">
              <div className="homepage-header">
                <h2 className="homepage-title">My Notifications</h2>
              </div>
              <div id="homepage-notifications">
                <p className="readDiv">Unread</p>
                {unreadNotifications.map((n) => (
                  <HomePageNotification
                    key={n.idNotifications}
                    id={n.idNotifications}
                    read_status={n.read_status}
                    type={n.type}
                    action={n.action}
                    idUser_Action={n.idUser_Action}
                    idGroup_Action={n.idGroup_Action}
                  />
                ))}
                <p className="readDiv">Read</p>
                {readNotifications.map((n) => (
                  <HomePageNotification
                    key={n.idNotifications}
                    id={n.idNotifications}
                    read_status={n.read_status}
                    type={n.type}
                    action={n.action}
                    idUser_Action={n.idUser_Action}
                    idGroup_Action={n.idGroup_Action}
                  />
                ))}
              </div>
            </div>
            <div className="groupSide">
              <div className="homepage-header">
                <h2 className="homepage-title">My Groups</h2>
                <input id="group-search" value={groupQuery} className="homepage-group-search" name="group-search" placeholder="Search a group" onChange={handleFilterGroups} />
              </div>
              <div id="homepage-groups" className="d-flex" style={{ height: '100%', overflow: 'auto' }}>
                {filteredGroups.map((g) => (
                  <HomePageGroup
                    key={g.idGroup}
                    id={g.idGroup}
                    src={g.profilePhoto}
                    groupName={g.groupName}
                    groupInfo={g.groupInfo}
                    members={g.members}
                    priv={g.private}
                    join="true"
                  />
                ))}
              </div>
              <button id="showAllGroups" type="button" onClick={() => history.push('/explore')}>View All</button>
            </div>
          </div>

          <div className="rightSide">
            <div className="homepage-header">
              <h2 className="homepage-title">Friends</h2>
              <input value={friendQuery} id="friend-search" className="homepage-friend-search" name="friend-search" placeholder="Search a friend" onChange={handleFilterFriends} />
            </div>
            <div id="homepage-friends">
              {filteredFriends.map((f) => (
                <HomePageFriend
                  key={f.idUsers}
                  id={f.idUsers}
                  src={f.profilePhoto}
                  name={f.username}
                />
              ))}
            </div>
            <button id="showAllFriends" type="button" onClick={() => history.push('/chat')}>View All</button>
          </div>
        </div>
      </div>
    )

  );
}
export default Homepage;
