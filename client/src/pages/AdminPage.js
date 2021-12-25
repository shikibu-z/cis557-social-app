/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import NavBar from '../components/NavBar';
import '../stylesheets/AdminPage.css';
import AdminBox from '../components/AdminBox';
import AdminNotification from '../components/AdminNotification';

import { getGroupInfo, getAdminNotes } from '../api/fetchers';
import GroupAnalyticBox from '../components/GroupAnalyticBox';

function AdminPage() {
  const id = localStorage.getItem('currUser');
  const [group, setGroup] = useState();
  const [adminNotes, setAdminNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    const url = window.location.href;
    const groupid = (url.split('/').slice(-2)[0]);
    const response = await getGroupInfo(id, groupid);
    setGroup(response.data);
    const res = await getAdminNotes(groupid);
    setAdminNotes(res.data);
    setIsLoading(false);
  }, []);

  return (
    !isLoading
    && (
    <div>
      <NavBar isLogin={0} />
      <div className="adminHeader">
        <img src={group.group.profilePhoto} alt="group-img" />
        <div id="adminNameWrapper">
          {group.group.groupName}
        </div>
      </div>
      <hr />
      <h2>Group Introduction</h2>
      <div className="adminGroupIntro">
        {group.group.groupInfo}
      </div>
      <h2>Analytics</h2>
      <GroupAnalyticBox groupId={group.group.idGroups} />
      <h2>Notifications</h2>
      {adminNotes.map((n) => (
        <AdminNotification note={n} group={group} />
      ))}
      <AdminBox group={group.group.idGroups} />
    </div>
    )
  );
}

export default withRouter(AdminPage);
