/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import CreateGroup from './CreateGroup';

test('Create group page matches snapshot', () => {
  const component = renderer.create(<CreateGroup />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
