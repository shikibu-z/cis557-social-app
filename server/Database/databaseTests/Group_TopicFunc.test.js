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

describe('Database operation: addTopicToGroup', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testGroup, testTopic;

  beforeEach(() => {
    testGroup = {
      groupName: 'testgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testTopic = 'test_sports';
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', 'testgroup').del();
    await knex('Topics').where('topic', 'test_sports').del();
  });

  test('addTopicToGroup inserts a new topic to group', async () => {
    const idGroup = await dbLib.addGroup(db, testGroup);
    await dbLib.addTopic(db, testTopic);
    await dbLib.addTopicToGroup(db, idGroup, testTopic);
    const relation = await knex('Group_Topic').where({ 'idGroup': idGroup, 'topic': 'test_sports'});
    expect(relation[0].idGroup).toBe(idGroup);
    await knex('Group_Topic').where({ 'idGroup':idGroup, 'topic':'test_sports' }).del();
  });

  test('addTopicToGroup throw exception if topic is undefined', async () => {
    const idGroup = await dbLib.addGroup(db, testGroup);
    await dbLib.addTopic(db, testTopic);
    try {
      await dbLib.addTopicToGroup(db, idGroup, undefined);
      await knex('Group_Topic').where({ 'idGroup': idGroup, 'topic': 'test_sports' }).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Databse operation: getAllGroupsOfSelectedTopics', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testGroup1, testGroup2, testGroup3, testTopic1, testTopic2, testTopic3;

  beforeEach(() => {
    testGroup1 = {
      groupName: 'testgroup1',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup3 = {
      groupName: 'testgroup3',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testTopic1 = 'test_sports';
    testTopic2 = 'test_music';
    testTopic3 = 'test_food';
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', 'testgroup1').del();
    await knex('Groups').where('groupName', 'testgroup2').del();
    await knex('Groups').where('groupName', 'testgroup3').del();
    await knex('Topics').where('topic', 'test_sports').del();
    await knex('Topics').where('topic', 'test_music').del();
    await knex('Topics').where('topic', 'test_food').del();
  });

  test('getAllGroupsOfSelectedTopics gets all groups with selected topics', async () => {
    const idGroup1 = await dbLib.addGroup(db, testGroup1);
    const idGroup2 = await dbLib.addGroup(db, testGroup2);
    const idGroup3 = await dbLib.addGroup(db, testGroup3);
    await dbLib.addTopic(db, testTopic1);
    await dbLib.addTopic(db, testTopic2);
    await dbLib.addTopic(db, testTopic3);
    await dbLib.addTopicToGroup(db, idGroup1, testTopic1);
    await dbLib.addTopicToGroup(db, idGroup2, testTopic2);
    await dbLib.addTopicToGroup(db, idGroup3, testTopic3);
    const groups = await dbLib.getAllGroupsOfSelectedTopics(db, [testTopic1, testTopic2]);
    expect(groups.length).toBe(2);
    await knex('Group_Topic').where({ 'idGroup': idGroup1, 'topic':'test_sports'}).del();
    await knex('Group_Topic').where({ 'idGroup': idGroup2, 'topic': 'test_music' }).del();
    await knex('Group_Topic').where({ 'idGroup': idGroup3, 'topic': 'test_food' }).del();
  });
});

