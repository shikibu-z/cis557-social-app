/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import ChatMessage from './ChatMessage';

test('ChatMessage matches snapshot', () => {
  const component = renderer.create(<ChatMessage message="" author="" curUser="" attachment="test.jpeg" />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
