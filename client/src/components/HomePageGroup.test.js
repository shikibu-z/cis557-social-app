/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import HomePageGroup from './HomePageGroup';

test('HomePageGroup matches snapshot', () => {
  const component = renderer.create(<BrowserRouter><HomePageGroup groupName="investing" /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
