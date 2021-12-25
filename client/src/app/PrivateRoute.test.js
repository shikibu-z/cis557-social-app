/* eslint-disable no-undef */
/* eslint-disable react/react-in-jsx-scope */
import { Redirect } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

test('test private route', () => {
  const data = true;
  const result = PrivateRoute({ data });
  expect(result).toStrictEqual(<Redirect to="/login" />);
});
