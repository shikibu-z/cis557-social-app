/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import HomePageFriend from './HomePageFriend';

test('HomepageFriend matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><HomePageFriend /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
