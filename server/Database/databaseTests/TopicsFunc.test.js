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

describe('Database operation: addTopic', () => {
  afterEach(async () => {
    await knex('Topics').where('topic', 'test_sports').del();
  });

  test('addTopic adds a topic into database', async () => {
    await dbLib.addTopic(db, 'test_sports');
    const topic = await knex('Topics').where('topic', 'test_sports');
    expect(topic[0].topic).toBe('test_sports');
  });

  test('addTopic throws exeption if topic undefined', async () => {
    try {
      await dbLib.addTopic(db, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getTopics', () => {
  afterEach(async () => {
    await knex('Topics').where('topic', 'test_sports').del();
    await knex('Topics').where('topic', 'test_music').del();
  });
  test('getTopics gets all topics from database', async () => {
    await dbLib.addTopic(db, 'test_sports');
    await dbLib.addTopic(db, 'test_music');
    const topics = await dbLib.getTopics(db);
    expect(topics.length).toBeGreaterThan(1);
  });
});