/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import GroupHeader from './GroupHeader';

test('GroupHeader matches snapshot', () => {
  const component = renderer.create(<GroupHeader src="" group={{ group: { groupName: 'test' } }} />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
