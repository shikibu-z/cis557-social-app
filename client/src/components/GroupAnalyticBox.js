import React, { useState, useEffect } from 'react';
import {
  Row, Col, ListGroup, Tab,
} from 'react-bootstrap';
import '../stylesheets/GroupAnalyticBox.css';
import { getGroupAnalytic } from '../api/fetchers';

function GroupAnalyticBox(props) {
  const { groupId } = props;
  // TODO: use fetcher to get analytics
  const [Members, setMembers] = useState(1);
  const [PostDeleted, setDeleted] = useState(1);
  const [PostNumber, setNumber] = useState(1);
  const [PostHidden, setHidden] = useState(1);
  const [PostFlagged, setFlagged] = useState(1);

  useEffect(async () => {
    const analytics = await getGroupAnalytic(groupId);
    setMembers(analytics.data.memberCount);
    setDeleted(analytics.data.deleted);
    setNumber(analytics.data.postCount);
    setHidden(analytics.data.hidden);
    setFlagged(analytics.data.flagged);
  }, [Members, PostDeleted, PostNumber, PostHidden, PostFlagged]);

  return (
    <div className="AnalyticsContainer">
      <div className="AnalyticBox">
        <Tab.Container id="Analytics-tabs" defaultActiveKey="#Groups">
          <Row>
            <Col sm={4}>
              <ListGroup>
                <ListGroup.Item action href="#Groups">
                  Groups
                </ListGroup.Item>
                <ListGroup.Item action href="#Posts">
                  Posts
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col sm={8}>
              <Tab.Content>
                <Tab.Pane eventKey="#Groups">
                  <ListGroup>
                    <ListGroup.Item>
                      Members: {Members}
                    </ListGroup.Item>
                  </ListGroup>
                </Tab.Pane>
                <Tab.Pane eventKey="#Posts">
                  <ListGroup>
                    <ListGroup.Item>
                      TotalPosts: {PostNumber}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      DeletedPost: {PostDeleted}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      HiddenPost: {PostHidden}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      FlaggedPost: {PostFlagged}
                    </ListGroup.Item>
                  </ListGroup>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    </div>
  );
}

export default GroupAnalyticBox;
