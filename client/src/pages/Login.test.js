/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import Login from './Login';

test('Login page matches snapshot', () => {
  const component = renderer.create(<Login />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
