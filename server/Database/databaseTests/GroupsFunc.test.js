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

describe('Database operation: addGroup', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testGroup;

  beforeEach(() => {
    testGroup = {
      groupName: 'testgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', 'testgroup').del();
  });
  
  test('addGroup inserts a new group', async () => {
    await dbLib.addGroup(db, testGroup);
    const newGroup = await knex.select('*').from('Groups').where('groupName', '=', testGroup.groupName);
    expect(newGroup[0].groupName).toBe(testGroup.groupName);
  });

  test('addGroup throw exception if groupName is null', async () => {
    testGroup.groupName = null;
    try {
      await dbLib.addGroup(db, testGroup);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getUser', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testGroup;

  beforeEach(() => {
    testGroup = {
      groupName: 'testgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', 'testgroup').del();
  });

  test('getGroup retrieves the group info', async () => {
    const id = await dbLib.addGroup(db, testGroup);
    const group = await dbLib.getGroup(db, id);
    expect(group.groupName).toBe(testGroup.groupName);
  });
});

describe('Database operation: getAllGroups', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testGroup;

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
      private: false,
      groupInfo: 'This is also a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkbahgg/'
    }
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', 'testgroup1').del();
    await knex('Groups').where('groupName', 'testgroup2').del();
  });

  test('getAllGroups retrieves all groups', async () => {
    await dbLib.addGroup(db, testGroup1);
    await dbLib.addGroup(db, testGroup2);
    const groups = await dbLib.getAllGroups(db);
    expect(groups.length).toBeGreaterThan(1);
  });
});

describe('Database operation: updateGroup', () => {
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  let testGroup;

  beforeEach(() => {
    testGroup = {
      groupName: 'testgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', 'testgroup').del();
  });

  test('updateGroup updates the group info', async () => {
    const id = await dbLib.addGroup(db, testGroup);
    const group = {
      groupInfo: 'This is an updated group info.',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
    await dbLib.updateGroup(db, id, group);
    const newGroup = await knex.select('*').from('Groups').where('groupName', '=', testGroup.groupName);
    expect(newGroup[0].groupInfo).toBe('This is an updated group info.');
  });
});
