/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import PersonalProfile from './PersonalProfile';

test('Profile page matches snapshot', () => {
  const component = renderer.create(<PersonalProfile />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
