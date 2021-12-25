require('dotenv').config();
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.host,
    port: 3306,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  }
});

const dbLib = require('../dbOperationMySQL');
let db;

beforeAll(async () => {
  db = await dbLib.connect();
})

afterAll(() => {
  db.end();
})

describe('Database operation: getAuth', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUserAuth;

  beforeEach(() => {
    testUserAuth = {
      email: 'testuserauth@gmail.com',
      username: 'testuserauth',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuserauth').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  test('getAuth retrieve the user auth', async () => {  
    const id = await dbLib.addUser(db, testUserAuth);
    const user = await dbLib.getAuth(db, id);
    expect(user.password_hash).toBe('asdzxc');
  });

  test('getAuth throws exception if id undefined', async () => {
    try {
      await dbLib.getAuth(db, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: updateAuth', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUserAuth;

  beforeEach(() => {
    testUserAuth = {
      email: 'testuserauth@gmail.com',
      username: 'testuserauth',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuserauth').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  test('updateAuth updates the user auth', async () => {
    const id = await dbLib.addUser(db, testUserAuth);
    const user = {
      password_hash: 'another_psw',
    };
    await dbLib.updateAuth(db, id, user);
    const newUser = await knex.select('*').from('Authentication').where('idUsers', '=', id);
    expect(user.password_hash).toBe('another_psw');
  });
});
