/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import Homepage from './Homepage';

test('Home page matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><Homepage /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
