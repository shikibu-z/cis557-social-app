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

describe('Database operation: addChatsMessage', () => {
  let testUser1, testMessage;
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
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_chatsgroup').del();
  });
  test('addChatsMessage add a ChatsMessage', async () => {
    const idChatsGroup1 = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    testMessage = {
      idUser: idUser1,
      idChatsGroup: idChatsGroup1,
      timestamp: datetime,
      message: 'Heyyyy!',
      attachment: null
    };
    const idMessage = await dbLib.addChatsMessage(db, testMessage);
    const chats = await knex('ChatsMessage').where('idChatsMessage', idMessage);
    expect(chats[0].idUser).toBe(idUser1);
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup1).del();
    await knex('ChatsMessage').where('idChatsMessage', idMessage).del();
  });
});

describe('Database operation: getAllChatsMessageOfChatsGroup', () => {
  let testUser1, testUser2, testMessage1, testMessage2, testMessage3;
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
  test('getAllChatsMessageOfChatsGroup gets all ChatsMessage of a chatsgroup', async () => {
    const idChatsGroup1 = await dbLib.addChatsGroup(db);
    const idChatsGroup2 = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    testMessage1 = {
      idUser: idUser1,
      idChatsGroup: idChatsGroup1,
      timestamp: datetime,
      message: 'Heyyyy!',
      attachment: null
    };
    testMessage2 = {
      idUser: idUser2,
      idChatsGroup: idChatsGroup1,
      timestamp: datetime,
      message: 'Whatsup?',
      attachment: null
    };
    testMessage3 = {
      idUser: idUser1,
      idChatsGroup: idChatsGroup2,
      timestamp: datetime,
      message: null,
      attachment: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    const idChatsMessage1 = await dbLib.addChatsMessage(db, testMessage1);
    const idChatsMessage2 = await dbLib.addChatsMessage(db, testMessage2);
    const idChatsMessage3 = await dbLib.addChatsMessage(db, testMessage3);
    const chats = await dbLib.getAllChatsMessageOfChatsGroup(db, idChatsGroup1);
    expect(chats.length).toBe(2);
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup1).del();
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup2).del();
    await knex('ChatsMessage').where('idChatsMessage', idChatsMessage1).del();
    await knex('ChatsMessage').where('idChatsMessage', idChatsMessage2).del();
    await knex('ChatsMessage').where('idChatsMessage', idChatsMessage3).del();
  });
});

describe('Database operation: getLatestChatsMessageOfChatsGroup', () => {
  let testUser1, testUser2, testMessage1, testMessage2;
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
  test('getLatestChatsMessageOfChatsGroup gets the latest chatsmessage', async () => {
    const idChatsGroup1 = await dbLib.addChatsGroup(db);
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    testMessage1 = {
      idUser: idUser1,
      idChatsGroup: idChatsGroup1,
      timestamp: datetime,
      message: 'Heyyyy!',
      attachment: null
    };
    testMessage2 = {
      idUser: idUser2,
      idChatsGroup: idChatsGroup1,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      message: 'Whatsup?',
      attachment: null
    };
    const idChatsMessage1 = await dbLib.addChatsMessage(db, testMessage1);
    const idChatsMessage2 = await dbLib.addChatsMessage(db, testMessage2);
    const chat = await dbLib.getLatestChatsMessageOfChatsGroup(db, idChatsGroup1);
    expect(chat.message).toBe('Whatsup?');
    await knex('ChatsGroup').where('idChatsGroup', idChatsGroup1).del();
    await knex('ChatsMessage').where('idChatsMessage', idChatsMessage1).del();
    await knex('ChatsMessage').where('idChatsMessage', idChatsMessage2).del();
  });

  test('getLatestChatsMessageOfChatsGroup throws exception if idChatsGroup undefined', async () => {
    try {
      await dbLib.getLatestChatsMessageOfChatsGroup(db, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query')
    }
  });
});