/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */
import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Profile from '../components/Profile';
import Editprofile from '../components/Editprofile';
import '../stylesheets/PersonalProfile.css';

import { fetchUserProfile, fetchUserGroups } from '../api/fetchers';

function PersonalProfile() {
  const id = localStorage.getItem('currUser');

  const [modalShow, setModalShow] = useState(false);
  const [profile, setProfile] = useState();
  const [groups, setGroups] = useState();
  const [isLoading, setIsLoading] = useState(true);

  function formatDate(d) {
    const m = (d.getMonth() + 1).toString();
    const day = d.getDate().toString();
    const y = d.getFullYear().toString();
    const res = m + '-' + day + '-' + y;
    return res;
  }

  useEffect(async () => {
    const prof = await fetchUserProfile(id);
    setProfile(prof.data);
    const userGroups = await fetchUserGroups(id);
    const gr = userGroups.data.map((g) => [g.profilePhoto, g.groupName]);
    setGroups(gr);
    setIsLoading(false);
  }, []);

  return (
    !isLoading
    && (
    <div>
      <NavBar isLogin={0} />
      <div className="container d-flex flex-column align-items-center justify-content-center">
        <Profile
          profileImage={profile.photo}
          userName={profile.username}
          registrationDate={formatDate(new Date(profile.registrationDate))}
          interests={profile.interests}
          gender={profile.gender}
          groupsInCommon={groups}
        />

        <div aria-hidden="true" id="edit-profile" onClick={() => setModalShow(true)}>
          <p style={{ color: 'white', 'font-size': '15px', 'font-weight': 'bold' }}>Edit Profile</p>
        </div>

        <Editprofile
          show={modalShow}
          onHide={() => setModalShow(false)}
          image={profile.photo}
        />
      </div>
    </div>
    )
  );
}

export default PersonalProfile;
