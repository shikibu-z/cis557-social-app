/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import ForgotUsername from './ForgotUsername';

test('ForgotUsername popup matches snapshot', () => {
  const component = renderer.create(<ForgotUsername />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
