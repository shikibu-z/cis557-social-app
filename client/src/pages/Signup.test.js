/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import Signup from './Signup';

test('Profile page matches snapshot', () => {
  const component = renderer.create(<Signup />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
