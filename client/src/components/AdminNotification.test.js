/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import AdminNotification from './AdminNotification';

test('Chat matches snapshot', () => {
  const component = renderer.create(<AdminNotification group="" note="" />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
