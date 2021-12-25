/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import ExploreGroups from './ExploreGroups';

test('Exploregroup page matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><ExploreGroups /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
