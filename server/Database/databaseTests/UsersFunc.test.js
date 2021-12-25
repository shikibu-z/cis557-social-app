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

describe('Database operation: addUser', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUser;

  beforeEach(() => {
    testUser = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  it('addUser inserts a new player', async () => {
    await dbLib.addUser(db, testUser);
    const newUser = await knex('Users').where('username', 'testuser');
    expect(newUser[0].username).toBe('testuser');
  });

  it('addUser works if profilePhoto is null', async () => {
    testUser = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: null
    };
    await dbLib.addUser(db, testUser);
    const newUser = await knex.select('*').from('Users').where('username', '=', 'testuser');
    expect(newUser[0].username).toBe('testuser');
  });

  it('addUser exception if email is null', async () => {
    testUser.email = null;
    try {
      await dbLib.addUser(db, testUser);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });

  it('addUser adds gender as \'\' if gender is not one of enum types', async () => {
    testUser = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'arbitary',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    await dbLib.addUser(db, testUser);
    const newUser = await knex.select('*').from('Users').where('username', '=', 'testuser');
    expect(newUser[0].gender).toBe("");
  });
});

describe('Database operation: getUser', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUser;

  beforeEach(() => {
    testUser = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  it('getUser exception if id does not exist', async () => {
    try {
      await dbLib.getUser(db, 'wronguser');
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });

  it('getUser gets the user if id exist', async () => {
    const id = await dbLib.addUser(db, testUser);
    const user = await dbLib.getUser(db, 'testuser');
    expect(user.username).toBe(testUser.username);
  });

  it('get user by id', async () => {
    const id = await dbLib.addUser(db, testUser);
    const res = await dbLib.getUserById(db, id);
    expect(res.username).toBe(testUser.username);
  });
});

describe('Database operation: getAllUsers', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUser1, testUser2;

  beforeEach(() => {
    testUser1 = {
      email: 'testuser01@gmail.com',
      username: 'testuser01',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser02@gmail.com',
      username: 'testuser02',
      password_hash: 'qweasd',
      registrationDate: datetime,
      gender: 'neutral',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3erF/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser01').del();
    await knex('Users').where('username', 'testuser02').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
    await knex('Authentication').where('password_hash', 'qweasd').del();
  });

  it('retrieve all users info', async () => {
    await dbLib.addUser(db, testUser1);
    await dbLib.addUser(db, testUser2);
    const users = await dbLib.getAllUsers(db);
    const userNames = users.map(a => a.username);
    expect(userNames.includes('testuser01')).toBe(true);
  });
});

describe('Database operation: updateUser', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUser;

  beforeEach(() => {
    testUser = {
      email: 'testuser01@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: ''
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  it('successfully updates user info', async () => {
    const id = await dbLib.addUser(db, testUser);
    const user = {
      photo: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
    await dbLib.updateUser(db, id, user);
    const newUser = await knex.select('*').from('Users').where('idUsers', '=', id);
    expect(newUser[0].profilePhoto).toBe("https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/");
  });
});

describe('Database operation: deleteUser', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUser;

  beforeEach(() => {
    testUser = {
      email: 'testuser01@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  it('successfully delete user', async () => {
    const id = await dbLib.addUser(db, testUser);
    const newUser = await knex.select('*').from('Users').where('idUsers', '=', id);
    expect(newUser[0].idUsers).toBe(id);
    const affectedRows = await dbLib.deleteUser(db, id);
    expect(affectedRows).toBe(1);
    const allUsers = await knex.select('*').from('Users');
    expect(allUsers.length > 0).toBe(true);
  });
});

describe('Database operation: get friends', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testUser;

  beforeEach(() => {
    testUser = {
      email: 'testuser01@gmail.com',
      username: 'testuser',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser').del();
    await knex('Authentication').where('password_hash', 'asdzxc').del();
  });

  it('get friends of id', async () => {
    const id = await dbLib.addUser(db, testUser);
    const friends = await dbLib.getFriends(db, id, -1);
    expect(friends.length).toBe(0);
  });
});