/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import ImageBox from './ImageBox';

test('Image box matches snapshot', () => {
  const component = renderer.create(<ImageBox />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
