const libEncrypt = require('./encryptHelper');

describe('[TEST] encryption function', () => {
  test('[TEST] hash password', async () => {
    const result = await libEncrypt.hashPassword('testPassword');
    expect(result.length).toEqual(60);
  });

  test('[TEST] check password', async () => {
    const hash = await libEncrypt.hashPassword('testPassword');
    const correct = await libEncrypt.checkPassword('testPassword', hash);
    expect(correct).toBe(true);
    const wrong = await libEncrypt.checkPassword('wrongPassword', hash);
    expect(wrong).toBe(false);
  });
});
