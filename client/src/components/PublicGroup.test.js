/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter } from 'react-router-dom';
import PublicGroup from './PublicGroup';

test('Public Group Snapshot', () => {
  const component = renderer.create(<BrowserRouter><PublicGroup /></BrowserRouter>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
