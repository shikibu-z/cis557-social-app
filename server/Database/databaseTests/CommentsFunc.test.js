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

describe('Database operation: addComment', () => {
  let testUser, testGroup, testPost, testComment;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_post@gmail.com',
      username: 'testuser_post',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_post',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_post').del();
    await knex('Groups').where('groupName', 'testgroup_post').del();
  });

  test('addComment adds a comment', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post',
      content: '500 character limit post',
      attachment: null
    }
    const idPost = await dbLib.addPost(db, testPost);
    testComment = {
      idUser: idUser,
      idPost: idPost,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      content: 'This is a sample commment'
    };
    const idComment = await dbLib.addComment(db, testComment);
    const comment = await knex('Comments').where('idComments', idComment);
    expect(comment[0].idComments).toBe(idComment);
    await knex('Posts').where('idPosts', idPost).del();
    await knex('Comments').where('idComments', idComment).del();
  });

  test('addComment throws exception if comment maldefined', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post',
      content: '500 character limit post',
      attachment: null
    };
    const idPost = await dbLib.addPost(db, testPost);
    testComment = {
      idUser: idUser,
      idPost: idPost,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      content: null
    };
    try {
      const idComment = await dbLib.addComment(db, testComment);
      await knex('Posts').where('idPosts', idPost).del();
      await knex('Comments').where('idComments', idComment).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllCommentsOfPost', () => {
  let testUser, testGroup, testPost, testComment1, testComment2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_post@gmail.com',
      username: 'testuser_post',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_post',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_post').del();
    await knex('Groups').where('groupName', 'testgroup_post').del();
  });

  test('getAllCommentsOfPost gets all comments of a post order by timestamp desc', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post',
      content: '500 character limit post',
      attachment: null
    }
    const idPost = await dbLib.addPost(db, testPost);
    testComment1 = {
      idUser: idUser,
      idPost: idPost,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      content: 'This is a sample commment'
    };
    testComment2 = {
      idUser: idUser,
      idPost: idPost,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      content: 'This is a sample commment'
    };
    const idComment1 = await dbLib.addComment(db, testComment1);
    const idComment2 = await dbLib.addComment(db, testComment2);
    const comment = await dbLib.getAllCommentsOfPost(db, idPost);
    expect(comment[0].idComments).toBe(idComment2);
    expect(comment[1].idComments).toBe(idComment1);
    await knex('Posts').where('idPosts', idPost).del();
    await knex('Comments').where('idComments', idComment1).del();
    await knex('Comments').where('idComments', idComment2).del();
  });
});

describe('Database operation: deleteComment', () => {
  let testUser, testGroup, testPost, testComment;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_post@gmail.com',
      username: 'testuser_post',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_post',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_post').del();
    await knex('Groups').where('groupName', 'testgroup_post').del();
  });

  test('deleteComment deletes a comment', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post',
      content: '500 character limit post',
      attachment: null
    }
    const idPost = await dbLib.addPost(db, testPost);
    testComment = {
      idUser: idUser,
      idPost: idPost,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      content: 'This is a sample commment'
    };
    const idComment = await dbLib.addComment(db, testComment);
    await dbLib.deleteComment(db, idComment);
    const comment = await knex('Comments').where('idComments', idComment);
    expect(comment.length).toBe(0);
    await knex('Posts').where('idPosts', idPost).del();
    await knex('Comments').where('idComments', idComment).del();
  });

  test('deleteComment throws exception if idComment undefined', async () => {
    try {
      await dbLib.deleteComment(db, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});
