/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import NavBar from './NavBar';

test('Navbar component matches snapshot', () => {
  const component = renderer.create(<NavBar />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
