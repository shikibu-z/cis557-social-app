/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import CommentDetail from './CommentDetail';

test('Comment Detail matches snapshot', () => {
  const component = renderer.create(<CommentDetail />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
