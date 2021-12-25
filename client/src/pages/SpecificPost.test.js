/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import SpecificPost from './SpecificPost';

test('SpecificPost matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><SpecificPost /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
