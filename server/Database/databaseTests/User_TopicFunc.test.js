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

describe('Database operation: addTopicToUser', () => {
  let testUser, testTopic;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_user_topic@gmail.com',
      username: 'testuser_user_topic',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testTopic = 'test_sports';
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_user_topic').del();
    await knex('Topics').where('topic', 'test_sports').del();
  });

  test('addTopicToUser adds a relation', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    await dbLib.addTopic(db, testTopic);
    await dbLib.addTopicToUser(db, idUser, testTopic);
    const relation = await knex('User_Topic').where({ 'idUser': idUser, 'topic': 'test_sports' });
    expect(relation[0].idUser).toBe(idUser);
    expect(relation[0].topic).toBe(testTopic);
    await knex('User_Topic').where({ 'idUser': idUser, 'topic': 'test_sports' }).del();
  });

  test('addTopicToUser throws exception if topic is not in the database', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    try {
      await dbLib.addTopicToUser(db, idUser, testTopic);
      await knex('User_Topic').where({ 'idUser': idUser, 'topic': 'test_sports' }).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: deleteTopicFromUser', () => {
  let testUser, testTopic;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_user_topic@gmail.com',
      username: 'testuser_user_topic',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testTopic = 'test_sports';
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_user_topic').del();
    await knex('Topics').where('topic', 'test_sports').del();
  });
  test('deleteTopicFromUser deletes a relation', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    await dbLib.addTopic(db, testTopic);
    await dbLib.addTopicToUser(db, idUser, testTopic);
    await dbLib.deleteTopicFromUser(db, idUser, testTopic);
    const relation = await knex('User_Topic').where({ 'idUser': idUser, 'topic': 'test_sports' });
    expect(relation.length).toBe(0);
    await knex('User_Topic').where({ 'idUser': idUser, 'topic': 'test_sports' }).del();
  });
  test('deleteTopicFromUser throws exception if testTopic undefined', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    try {
      await dbLib.deleteTopicFromUser(db, idUser, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllTopicsOfUser', () => {
  let testUser1, testUser2, testTopic1, testTopic2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_topic@gmail.com',
      username: 'testuser1_user_topic',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_topic@gmail.com',
      username: 'testuser2_user_topic',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testTopic1 = 'test_sports';
    testTopic2 = 'test_music';
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_topic').del();
    await knex('Users').where('username', 'testuser2_user_topic').del();
    await knex('Topics').where('topic', 'test_sports').del();
    await knex('Topics').where('topic', 'test_music').del();
  });
  
  test('getAllTopicsOfUser get all topics a user is interested in', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    await dbLib.addTopic(db, testTopic1);
    await dbLib.addTopic(db, testTopic2);
    await dbLib.addTopicToUser(db, idUser1, testTopic1);
    await dbLib.addTopicToUser(db, idUser1, testTopic2);
    await dbLib.addTopicToUser(db, idUser2, testTopic1);
    const relation = await dbLib.getAllTopicsOfUser(db, idUser1);
    expect(relation.length).toBe(2);
    await knex('User_Topic').where({ 'idUser': idUser1, 'topic': 'test_sports' }).del();
    await knex('User_Topic').where({ 'idUser': idUser1, 'topic': 'test_music' }).del();
    await knex('User_Topic').where({ 'idUser': idUser2, 'topic': 'test_sports' }).del();
  });
});