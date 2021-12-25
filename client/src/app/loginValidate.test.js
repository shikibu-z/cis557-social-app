/* eslint-disable no-undef */
import loginValidate from './loginValidate';

describe('[TEST] test login validation', () => {
  test('login validation pass', () => {
    const data = {
      email: 'test@test.com',
      username: 'test',
      password: 'Test@test123',
      gender: '',
    };
    const result = loginValidate(data);
    expect(result.email).not.toBe(null);
  });

  test('login validation email fail', () => {
    const data = {
      email: 'some incorrect email',
      username: 'test',
      password: 'Test@test123',
      gender: '',
    };
    const result = loginValidate(data);
    expect(result.email).toBe(null);
  });
});
