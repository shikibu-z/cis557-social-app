/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import PostDialog from './PostDialog';

test('Comment Detail matches snapshot', () => {
  const component = renderer.create(<PostDialog />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
