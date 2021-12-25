/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from './AdminPage';

test('Chat page matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><AdminPage /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
