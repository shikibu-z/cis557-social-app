/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import axios from 'axios';
import { React, useState } from 'react';
import {
  useHistory,
} from 'react-router-dom';
import {
  Form, Col, Row, Button,
} from 'react-bootstrap';
import NavBar from '../components/NavBar';
import '../stylesheets/CreateGroup.css';
import ImageBox from '../components/ImageBox';

import { createGroup } from '../api/fetchers';

require('dotenv').config();

function CreateGroup() {
  const id = localStorage.getItem('currUser');
  const history = useHistory();

  const [tags, setTags] = useState([]);
  const [text, setText] = useState('');
  const [formData, setFormData] = useState({
    groupName: '', groupIntro: '', private: 0,
  });

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const addTag = () => {
    if (!tags.includes(text.toLowerCase())) {
      setTags([...tags, text.toLowerCase()]);
    }
    setText('');
  };

  const removeTag = (e) => {
    const toRemove = e.target.innerText;
    const newArr = tags.filter((item) => item !== toRemove);
    setTags(newArr);
  };

  const handleVerification = (data) => {
    if (data.groupName === '' || data.groupIntro === '' || data.profilePhoto === undefined) {
      return false;
    }
    return true;
  };

  async function upload(image) {
    const obj = {
      ...formData, userid: id, profilePhoto: image, groupTags: tags,
    };
    if (handleVerification(obj)) {
      const data = new FormData();
      data.append('file', image);
      data.append('upload_preset', 'ml_default');
      data.append('cloud_name', 'cis557-project');
      const res = await axios.post(
        process.env.REACT_APP_cloudinary_image, data,
      );
      return res;
    }
    return { status: 400 };
  }

  const submit = async (e) => {
    try {
      e.preventDefault();
      const photo = document.getElementById('imgInp').files[0];
      const res = await upload(photo);
      if (res.status === 200) {
        const data = {
          ...formData, userid: id, profilePhoto: res.data.secure_url, groupTags: tags,
        };
        const response = await createGroup(data);
        if (response.status === 201) {
          history.push(`/explore/${response.data}`);
        }
      }
    } catch (err) {
    }
  };

  return (
    <div>
      <NavBar isLogin={0} />
      <div className="title">
        <h3>Create a Group</h3>
      </div>
      <hr />
      <div className="group">
        <ImageBox />
      </div>
      <div className="groupInfo">
        <Form onSubmit={submit}>
          <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
            <Form.Label column sm={2}>
              Title
            </Form.Label>
            <Col sm={5}>
              <Form.Control
                placeholder="Title"
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
            <Form.Label column sm={2}>
              Description
            </Form.Label>
            <Col sm={5}>
              <Form.Control
                as="textarea"
                placeholder="Write a group description"
                onChange={(e) => setFormData({ ...formData, groupIntro: e.target.value })}
                style={{ height: '100px' }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formHorizontalCheck">
            <Col sm={{ span: 10, offset: 2 }}>
              <Form.Check
                label="I want to keep group private"
                onChange={(e) => setFormData({ ...formData, private: Number(e.target.checked) })}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb.3">
            <Form.Label column sm={2}>
              Tags
            </Form.Label>
            <Col sm={2}>
              <Form.Control id="inpTag" onChange={handleChange} value={text} placeholder="tag" />
            </Col>
            <Col sm={2}>
              <Button onClick={addTag} id="add">Add</Button>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Col sm={{ span: 10, offset: 2 }}>
              {tags.map((item) => (
                <Button style={{ color: '#F8B114' }} variant="dark" key={item} onClick={removeTag} className="tags">{item}</Button>
              ))}
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Col className="mt-3" sm={{ span: 10, offset: 2 }}>
              <Button className="createGroupBtn" type="submit">Create Group</Button>
            </Col>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}

export default CreateGroup;
