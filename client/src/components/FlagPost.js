/* eslint-disable react/jsx-props-no-spreading */
import {
  Modal, Form, Button,
} from 'react-bootstrap';
import { React } from 'react';
import '../stylesheets/Editprofile.css';

const lib = require('../api/fetchers');

function FlagPost(props) {
  const {
    show, onHide, handleFlag, handleClose, groupId, postId, userId,
  } = props;

  const reportDelete = () => {
    lib.hideOrFlagPost(groupId, postId, { flag: true, hide: false, userId });
    handleFlag();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton />
      <Modal.Body>
        <div>
          <h4>Flag this post for deletion?</h4>
          <Form>
            <Form.Group className="mb-3" id="deactivateButton">
              <Button
                onClick={handleClose}
                style={{
                  backgroundColor: 'red', color: 'white', position: 'absolute', left: '35%',
                }}
              >
                No
              </Button>
            </Form.Group>
            <Button onClick={reportDelete} variant="primary">
              Yes
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default FlagPost;
