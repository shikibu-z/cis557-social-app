/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable react/jsx-props-no-spreading */
import axios from 'axios';
import {
  Modal, Form, Col, Row, Button,
} from 'react-bootstrap';
import {
  useHistory,
} from 'react-router-dom';
import { React, useState } from 'react';
import ImageBox from './ImageBox';
import '../stylesheets/Editprofile.css';

const lib = require('../api/fetchers');

require('dotenv').config();

function Editprofile(props) {
  const history = useHistory();
  const userid = localStorage.getItem('currUser');
  const { image } = props;
  const [tags, setTags] = useState([]);
  const [text, setText] = useState('');
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '' });

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

  async function upload(i) {
    const data = new FormData();
    data.append('file', i);
    data.append('upload_preset', 'ml_default');
    data.append('cloud_name', 'cis557-project');
    const res = await axios.post(
      process.env.REACT_APP_cloudinary_image, data,
    );
    return res;
  }

  const submit = async (e) => {
    e.preventDefault();
    let photoUrl = '';
    const profilePhoto = document.getElementById('imgInp').files[0];
    if (profilePhoto !== undefined) {
      const res = await upload(profilePhoto);
      if (res.status === 200) {
        photoUrl = res.data.secure_url;
      }
    }
    const data = {
      ...formData, id: userid, photo: photoUrl, tag: tags,
    };
    const res = await lib.editUserProfile(userid, data);
    if (res.status === 200) {
      window.location.reload();
    }
  };

  const handleDelete = async (e) => {
    try {
      const res = await lib.deleteAccount(userid);
      if (res.status === 200) {
        localStorage.removeItem('currUser');
        history.push('/login');
        return;
      }
    } catch (err) {
    }
    e.preventDefault();
  };

  return (
    <Modal {...props}>
      <Modal.Header closeButton />
      <Modal.Body>
        <div>
          <ImageBox image={image} />
        </div>
        <div>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridPassword">
                <Form.Label>Old Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })} />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
              </Form.Group>
            </Row>

            <Form.Group as={Row} className="mb.3">
              <Form.Label column sm={2}>
                Interests
              </Form.Label>
              <Col sm={6}>
                <Form.Control onChange={handleChange} value={text} placeholder="tag" />
              </Col>
              <Col sm={2}>
                <Button onClick={addTag} id="add">Add</Button>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Col sm={{ span: 10, offset: 2 }}>
                {tags.map((item) => (
                  <Button variant="dark" key={item} onClick={removeTag}>
                    {item}
                  </Button>
                ))}
              </Col>
            </Form.Group>

            <Form.Group className="mb-3 button-group">
              <Button
                variant="danger"
                style={{ 'background-color': '#c7524a', 'border-color': '#c7524a' }}
                type="button"
                onClick={handleDelete}
              >
                Deactivate Account
              </Button>
              <Button onClick={submit} variant="primary" type="submit">
                Confirm Changes
              </Button>
            </Form.Group>

          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default Editprofile;
