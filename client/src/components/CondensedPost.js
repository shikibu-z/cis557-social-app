/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-bind */
import { React, useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  Link,
} from 'react-router-dom';
import {
  Flag,
} from 'react-bootstrap-icons';
// import VoteBox from './VoteBox';
import FlagPost from './FlagPost';
import SpecificPost from '../pages/SpecificPost';

function CondensedPost(props) {
  const {
    group, title, info, isFlagged, postid,
  } = props;
  const userId = localStorage.getItem('currUser');
  const postId = postid.toString();
  const [flagged, setFlagged] = useState(isFlagged);
  const [modalShow, setModalShow] = useState(false);

  function handleClick() {
    if (!flagged) {
      setModalShow(true);
    }
  }

  useEffect(() => {
    if (flagged) {
      const element = document.getElementById(postId);
      element.style.color = '#F8B114';
    }
  }, [flagged]);

  return (
    <div>
      <Card style={{
        width: '55rem',
        height: '7rem',
      }}
      >
        <Row className="g-4">
          <Col xs={12} md={11}>
            <Card style={{ border: 'none' }}>
              <Card.Header style={{
                fontFamily: 'Roboto',
                fontSize: '1.5em',
                backgroundColor: 'white',
                border: 'none',
                fontWeight: 'bold',
              }}
              ><Link style={{ textDecoration: 'none', color: 'black' }} to={`/explore/${group}/${postId}`}>{title}</Link>

              </Card.Header>
            </Card>
            <Card style={{
              border: 'none',
              textAlign: 'right',
              position: 'absolute',
              bottom: '0',
              right: '0',
            }}
            >
              <Card.Text><Flag id={postId} className="flag" onClick={handleClick} /> {info}</Card.Text>
            </Card>
          </Col>
        </Row>
      </Card>
      <FlagPost
        show={modalShow}
        onHide={() => setModalShow(false)}
        handleFlag={() => { setFlagged(true); setModalShow(false); }}
        handleClose={() => setModalShow(false)}
        groupId={group}
        postId={postId}
        userId={userId}
      />
    </div>
  );
}

export default CondensedPost;
