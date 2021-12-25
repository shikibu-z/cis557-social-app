/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import InviteUser from './InviteUser';

test('Invite User Snapshot', () => {
  const component = renderer.create(<InviteUser />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
