/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import Editprofile from './Editprofile';

test('Edit profile matches snapshot', () => {
  const component = renderer.create(<Editprofile interests={['nba', 'sports']} />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
