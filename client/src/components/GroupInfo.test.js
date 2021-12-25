/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import GroupInfo from './GroupInfo';

test('Group info box matches snapshot', () => {
  const component = renderer.create(<GroupInfo groupInfo={{group:{groupName:""}}}/>);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
