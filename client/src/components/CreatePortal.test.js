/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import CreatePortal from './CreatePortal';

test('CreatePortal matches snapshot', () => {
  const component = renderer.create(<CreatePortal />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
