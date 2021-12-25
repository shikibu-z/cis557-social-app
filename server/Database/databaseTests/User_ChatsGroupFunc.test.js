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

describe('Database operation: addUserToChatsGroup', () => {
  let testUser1, testUser2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_chatsgroup@gmail.com',
      username: 'testuser1_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_chatsgroup@gmail.com',
      username: 'testuser2_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_chatsgroup').del();
    await knex('Users').where('username', 'testuser2_user_chatsgroup').del();
  });
  test('addUserToChatsGroup adds a user to chatsgroup', async () => {
    const idChatsGroup = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToChatsGroup(db, idChatsGroup, idUser1);
    await dbLib.addUserToChatsGroup(db, idChatsGroup, idUser2);
    const relation = await knex('User_ChatsGroup').where('idChatsGroup', idChatsGroup);
    expect(relation.length).toBe(2);
    expect(relation[0].idUser).toBe(idUser1);
    expect(relation[1].idUser).toBe(idUser2);
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup, 'idUser': idUser1 }).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup, 'idUser': idUser2 }).del();
  });
  test('addUserToChatsGroup throws exception if idChatsGroup not exist', async () => {
    try {
      const idUser1 = await dbLib.addUser(db, testUser1);
      await dbLib.addUserToChatsGroup(db, undefined, idUser1);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllUsersOfChatsGroup', () => {
  let testUser1, testUser2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_chatsgroup@gmail.com',
      username: 'testuser1_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_chatsgroup@gmail.com',
      username: 'testuser2_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_chatsgroup').del();
    await knex('Users').where('username', 'testuser2_user_chatsgroup').del();
  });
  test('getAllUsersOfChatsGroup gets all users of a chatsgroup', async () => {
    const idChatsGroup1 = await dbLib.addChatsGroup(db);
    const idChatsGroup2 = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToChatsGroup(db, idChatsGroup1, idUser1);
    await dbLib.addUserToChatsGroup(db, idChatsGroup1, idUser2);
    await dbLib.addUserToChatsGroup(db, idChatsGroup2, idUser2);
    const relation = await dbLib.getAllUsersOfChatsGroup(db, idChatsGroup1);
    expect(relation.length).toBe(2);
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup1).del();
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup2).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup1, 'idUser': idUser1 }).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup1, 'idUser': idUser2 }).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup2, 'idUser': idUser2 }).del();
  });
});

describe('Database operation: getAllChatsGroupForUser', () => {
  let testUser1, testUser2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_chatsgroup@gmail.com',
      username: 'testuser1_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_chatsgroup@gmail.com',
      username: 'testuser2_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_chatsgroup').del();
    await knex('Users').where('username', 'testuser2_user_chatsgroup').del();
  });
  test('getAllChatsGroupForUser gets all chatsgroups of user', async () => {
    const idChatsGroup1 = await dbLib.addChatsGroup(db);
    const idChatsGroup2 = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToChatsGroup(db, idChatsGroup1, idUser1);
    await dbLib.addUserToChatsGroup(db, idChatsGroup1, idUser2);
    await dbLib.addUserToChatsGroup(db, idChatsGroup2, idUser2);
    const relation = await dbLib.getAllChatsGroupForUser(db, idUser2);
    expect(relation.length).toBe(2);
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup1).del();
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup2).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup1, 'idUser': idUser1 }).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup1, 'idUser': idUser2 }).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup2, 'idUser': idUser2 }).del();
  });
});

describe('Database operation: deleteUserFromChatsGroup', () => {
  let testUser1, testUser2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_chatsgroup@gmail.com',
      username: 'testuser1_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_chatsgroup@gmail.com',
      username: 'testuser2_user_chatsgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_chatsgroup').del();
    await knex('Users').where('username', 'testuser2_user_chatsgroup').del();
  });
  test('deleteUserFromChatsGroup deletes a user from chatsgroup', async () => {
    const idChatsGroup = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToChatsGroup(db, idChatsGroup, idUser1);
    await dbLib.addUserToChatsGroup(db, idChatsGroup, idUser2);
    await dbLib.deleteUserFromChatsGroup(db, idChatsGroup, idUser1);
    const relation = await knex('User_ChatsGroup').where('idChatsGroup', idChatsGroup);
    expect(relation.length).toBe(1);
    expect(relation[0].idUser).toBe(idUser2);
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup, 'idUser': idUser1 }).del();
    await knex('User_ChatsGroup').where({ 'idChatsGroup': idChatsGroup, 'idUser': idUser2 }).del();
  });
});