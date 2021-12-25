/* eslint-disable no-undef */
import useAuth from './Authentication';

test('test authentication', () => {
  const result = useAuth();
  expect(result).toBe(false);
});
