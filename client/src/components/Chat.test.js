/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import Chat from './Chat';

test('Chat matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><Chat latestMessage="good" /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
