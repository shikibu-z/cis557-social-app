/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import Chatpage from './Chatpage';

test('Chat page matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><Chatpage match={{params: 1}} /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
