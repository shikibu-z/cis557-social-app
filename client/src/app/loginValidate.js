function loginValidate(userObject) {
  const regEmail = /\S+@\S+\.\S+/;
  const regPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  const result = {
    email: userObject.email,
    username: userObject.username,
    password: userObject.password,
    gender: userObject.gender,
  };
  if (result.email !== '' && !regEmail.test(result.email)) {
    result.email = null;
    return result;
  }
  if (result.username === '') {
    // ? any other validation
    result.username = null;
    return result;
  }
  if (result.password === '' || !regPass.test(userObject.password)) {
    result.password = null;
    return result;
  }
  return result;
}

export default loginValidate;
