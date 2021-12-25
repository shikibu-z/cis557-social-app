import React from 'react';
import './App.css';
import './stylesheets/Login.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Login from './pages/Login';
// import Signup from './pages/Signup';
import Homepage from './pages/Homepage';
import Chatpage from './pages/Chatpage';
import PersonalProfile from './pages/PersonalProfile';
// import CreateGroup from './pages/CreateGroup';

import PrivateRoute from './app/PrivateRoute';
import PublicGroup from './components/PublicGroup';
import Signup from './pages/Signup';
import SpecificPost from './pages/SpecificPost';
import ExploreGroups from './pages/ExploreGroups';
import CreateGroup from './pages/CreateGroup';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/signup">
          <Signup />
        </Route>
        <PrivateRoute exact path="/homepage">
          <Homepage />
        </PrivateRoute>
        <PrivateRoute exact path="/explore/:group/admin">
          <AdminPage />
        </PrivateRoute>
        <PrivateRoute exact path="/personalprofile">
          <PersonalProfile />
        </PrivateRoute>
        <Route path="/chat/:friendId?" component={Chatpage} />
        <PrivateRoute exact path="/creategroup">
          <CreateGroup />
        </PrivateRoute>
        <PrivateRoute exact path="/explore/:group/:id">
          <SpecificPost />
        </PrivateRoute>
        <PrivateRoute exact path="/explore/:group">
          <PublicGroup />
        </PrivateRoute>
        <PrivateRoute exact path="/explore">
          <ExploreGroups />
        </PrivateRoute>
        <Redirect to="/login" />
      </Switch>
    </Router>
  );
}

export default App;
