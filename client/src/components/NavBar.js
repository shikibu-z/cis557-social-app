/* eslint-disable operator-linebreak */
/* eslint-disable import/no-extraneous-dependencies */
import { React } from 'react';
import {
  Navbar, Container, Nav, Button,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../stylesheets/NavBar.css';
import {
  HouseDoorFill, CollectionFill, ChatFill, PersonFill, BoxArrowInRight,
} from 'react-bootstrap-icons';
import { useHistory } from 'react-router';

function NavBar(props) {
  const { isLogin } = props;
  const history = useHistory();
  const handleLogout = () => {
    // cleanup user info when logging out
    localStorage.clear();
    history.push('/login');
  };
  return (
    <div>
      <Navbar className="menu" bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand href="#home">
            <img
              id="logo"
              src="../Connexion-logos_transparent.png"
              alt="connexion"
              className="d-inline-block align-top"
            />{' '}
          </Navbar.Brand>
          {isLogin === 0 &&
            (
              <div>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                  <Nav
                    className="me-auto my-2 my-lg-0"
                    style={{ maxHeight: '100px' }}
                    navbarScroll
                  >
                    <Button id="home" className="NavBar-buttons" onClick={() => { history.push('/homepage'); }}><HouseDoorFill /></Button>
                    <Button id="createGroup" className="NavBar-buttons" onClick={() => { history.push('/explore'); }}><CollectionFill /></Button>
                    <Button id="chat" className="NavBar-buttons" onClick={() => { history.push('/chat'); }}><ChatFill /></Button>
                    <Button id="profile" className="NavBar-buttons" onClick={() => { history.push('/personalprofile'); }}><PersonFill /></Button>
                    <Button id="logout" className="NavBar-buttons" onClick={handleLogout}><BoxArrowInRight /></Button>
                  </Nav>
                </Navbar.Collapse>
              </div>
            )}
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;
