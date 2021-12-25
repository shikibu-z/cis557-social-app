/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import CondensedPost from './CondensedPost';

test('Condensed post matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><CondensedPost group="test" title="testt" info="test" isFlagged={false} postid={1} /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
