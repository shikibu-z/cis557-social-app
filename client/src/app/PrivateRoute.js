import React from 'react';
import { Redirect } from 'react-router-dom';
import useAuth from './Authentication';

function PrivateRoute({ children }) {
  const auth = useAuth();
  return auth ? children : <Redirect to="/login" />;
}

export default PrivateRoute;
