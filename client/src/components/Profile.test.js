/*eslint-disable */
import React from 'react';
import renderer from 'react-test-renderer';
import Profile from './Profile';

test('Profile component matches snapshot', () => {
  const component = renderer.create(<Profile
    profile_image="http://i.stack.imgur.com/Dj7eP.jpg"
    user_name="hello123"
    registrationDate="06/05/2021"
    interests={['sports', 'stock market']}
    gender="Male (He/Him/His)"
    groupsInCommon={[['https://cdn.vox-cdn.com/thumbor/ILugzkwUR0oRQFWskaSrcY3LJ4U=/0x0:4173x2582/1200x800/filters:focal(1754x958:2420x1624)/cdn.vox-cdn.com/uploads/chorus_image/image/66757988/1158933034.jpg.0.jpg', 'stock watcher'],
      ['https://static.nfl.com/static/content/public/static/img/navigation/shields/header-shield.png', 'NFL']]}
  />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
