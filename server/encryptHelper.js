const salt = 10;
const bcrypt = require('bcrypt');

const hashPassword = async (plain) => {
  const result = await bcrypt.hash(plain, salt);
  return result;
}

const checkPassword = async (plain, hash) => {
  const result = await bcrypt.compare(plain, hash);
  return result;
}

module.exports = {
  hashPassword, checkPassword
}
