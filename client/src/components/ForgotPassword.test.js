/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import ForgotPassword from './ForgotPassword';

test('ForgotPassword popop matches snapshot', () => {
  const component = renderer.create(<ForgotPassword />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
