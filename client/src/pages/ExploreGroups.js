/* eslint-disable consistent-return */
/* eslint-disable prefer-template */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Dropdown, DropdownButton, Button, Toast, Stack, Form, Row, Col,
} from 'react-bootstrap';
import NavBar from '../components/NavBar';
import HomePageGroup from '../components/HomePageGroup';
import '../stylesheets/ExploreGroups.css';

import {
  getTopics, getPublicGroups, getSortedGroups, getSuggestedGroups,
} from '../api/fetchers';

function ExploreGroups() {
  // groups after name search & topic filter
  const [groups, setGroups] = useState([]);
  // groups fetched from remote by tags
  const [fetchedGroups, setFetchedGroups] = useState([]);
  // the group name query user input
  const [groupQuery, setGroupQuery] = useState('');

  // user input topic
  const [topic, setTopic] = useState('');
  // group tag filter
  const [filterTopics, setFilterTopics] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);

  const [showFilter, setShowFilter] = useState(false);

  const history = useHistory();
  const id = localStorage.getItem('currUser');

  // get popular topics if there's one when loading the page
  const updatePopularTopics = async () => {
    try {
      const tmp = [];
      const topics = await getTopics();
      if (topics.data.length !== 0) {
        topics.data.forEach((entry) => {
          tmp.push(entry.topic);
        });
      }
      const response = await getPublicGroups(id);
      setPopularTopics(tmp);
      setGroups(response.data);
      setFetchedGroups(response.data);
    } catch (err) {
      return err;
    }
  };
  useEffect(() => {
    updatePopularTopics();
  }, []);

  // fetch groups by provided topics
  const fetchRemoteByTopics = async () => {
    try {
      let query = id;
      const tmp = [];
      if (filterTopics.length !== 0) {
        filterTopics.forEach((entry) => {
          tmp.push(entry + '=true');
        });
        query += '?' + tmp.join('&');
      }
      const response = await getPublicGroups(query);
      setGroups(response.data);
      setFetchedGroups(response.data);
    } catch (err) {
      return err;
    }
  };
  useEffect(() => {
    fetchRemoteByTopics();
  }, [filterTopics]);

  // filter fetched groups by name
  const handleFilterGroups = (e) => {
    const query = e.target.value;
    if (query !== '') {
      const res = groups.filter(
        (group) => group.group.groupName.toLowerCase().startsWith(query.toLowerCase()),
      );
      setGroups(res);
    } else {
      setGroups(fetchedGroups);
    }
    setGroupQuery(query);
  };

  // remove a topic tag
  const removeTag = (e) => {
    const toRemove = e.target.innerText;
    const newArr = filterTopics.filter((item) => item !== toRemove);
    setFilterTopics(newArr);
  };

  // read manual input tag
  const handleChange = (e) => {
    setTopic(e.target.value);
  };

  // add manual input tag to filter list
  const addTopic = () => {
    if (!filterTopics.includes(topic.toLowerCase())) {
      setFilterTopics([...filterTopics, topic.toLowerCase()]);
    }
    setTopic('');
  };

  // add provided popular tags to filter list
  const handleAddTopic = (e) => {
    const toAdd = e.target.innerText;
    if (!filterTopics.includes(toAdd.toLowerCase())) {
      setFilterTopics([...filterTopics, toAdd.toLowerCase()]);
    }
  };

  const handleSorting = async (e) => {
    try {
      let query = e.toString();
      const tmp = [];
      if (filterTopics.length !== 0) {
        filterTopics.forEach((entry) => {
          tmp.push(entry + '=true');
        });
        query += '?' + tmp.join('&');
      }
      const response = await getSortedGroups(query);
      setFetchedGroups(response.data);
      setGroups(response.data);
    } catch (err) {
      return err;
    }
  };

  const handleSuggested = async (event) => {
    try {
      if (event === 'all') {
        await updatePopularTopics();
      } else if (event === 'suggested') {
        const response = await getSuggestedGroups(id);
        setFetchedGroups(response.data);
        setGroups(response.data);
      }
    } catch (err) {
      return err;
    }
  };

  return (
    <div>
      <NavBar isLogin={0} />
      <div className="home">
        <div className="groupSide d-flex">
          <div className="exploregroup-header">
            <input id="group-search" value={groupQuery} className="homepage-group-search" name="group-search" placeholder="Search a group" onChange={handleFilterGroups} />
            <DropdownButton onSelect={handleSorting} variant="secondary" title="Sort By">
              <Dropdown.Item eventKey="recent" as="button">Most Recent</Dropdown.Item>
              <Dropdown.Item eventKey="post" as="button">Most Posts</Dropdown.Item>
              <Dropdown.Item eventKey="member" as="button">Most Members</Dropdown.Item>
            </DropdownButton>
            <Button style={{ 'background-color': '#C4C4C4', 'border-color': '#C4C4C4' }} variant="secondary" onClick={() => { setShowFilter(true); }}>Filter By</Button>
            <Toast
              onClose={() => setShowFilter(false)}
              show={showFilter}
              delay={3000}
              style={{
                position: 'absolute', top: '27%', left: '55%', width: '500px',
              }}
            >
              <Toast.Header closeButton />
              <Toast.Body>
                <Stack direction="vertical" gap={3}>
                  <div>
                    <big>Filtered Topic</big>
                    <Form>
                      <Form.Group as={Row} className="justify-content-md-center">
                        <Col md={6}>
                          <Form.Control placeholder="Topic" value={topic} onChange={handleChange} />
                        </Col>
                        <Col md={2}>
                          <Button onClick={addTopic}>Add</Button>
                        </Col>
                      </Form.Group>
                    </Form>
                  </div>
                  <div>
                    <big>PopularTopics</big>
                    <div>
                      {popularTopics.map((tag) => (
                        <Button key={tag} onClick={handleAddTopic}>{tag}</Button>
                      ))}
                    </div>
                  </div>
                </Stack>
              </Toast.Body>
            </Toast>
            <DropdownButton onSelect={handleSuggested} variant="secondary" title="Suggested">
              <Dropdown.Item eventKey="all" as="button">All Groups</Dropdown.Item>
              <Dropdown.Item eventKey="suggested" as="button">Suggested Groups</Dropdown.Item>
            </DropdownButton>
            <Button id="btn-creategroup" size="lg" onClick={() => { history.push('/creategroup'); }}>Create Group</Button>
          </div>
          <div className="mt-2 col-md-12" />
          <div>
            <h3 style={{ 'margin-left': '1%' }}>Filtered Topics:</h3>
            <div style={{ 'margin-left': '1%' }}>
              {filterTopics && (
                filterTopics.map((tag) => (
                  <Button variant="dark" key={tag} onClick={removeTag}>
                    {tag}
                  </Button>
                ))
              )}
            </div>
          </div>
          <div className="mt-2 col-md-12" />
          <div id="homepage-groups">
            {groups.map((g) => (
              <HomePageGroup
                id={g.group.idGroups}
                src={g.group.profilePhoto}
                groupName={g.group.groupName}
                groupInfo={g.group.groupInfo}
                members={g.numOfMembers}
                priv={0}
                join={g.isJoined.toString()}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreGroups;
