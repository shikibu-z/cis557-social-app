/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import AdminBox from './AdminBox';

test('Chat matches snapshot', () => {
  const component = renderer.create(<AdminBox group="" />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
