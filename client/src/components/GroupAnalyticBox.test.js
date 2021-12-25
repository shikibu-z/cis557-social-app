/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import GroupAnalyticBox from './GroupAnalyticBox';

test('GroupAnalyticBox popup matches snapshot', () => {
  const component = renderer.create(<GroupAnalyticBox />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
