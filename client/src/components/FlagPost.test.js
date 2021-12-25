/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import FlagPost from './FlagPost';

test('Flag post matches snapshot', () => {
  const component = renderer.create(<FlagPost />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
