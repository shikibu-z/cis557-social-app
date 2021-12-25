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

describe('Database operation: addHidePost', () => {
  let testUser, testGroup, testPost;
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
  test('addHidePost adds a hide relation', async () => {
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
    const idHidePost = await dbLib.addHidePost(db, idUser, idPost);
    const relation = await knex('HidePosts').where({ 'idUser': idUser, 'idPosts': idPost });
    expect(relation[0].idHidePosts).toBe(idHidePost);
    await knex('Posts').where('idPosts', idPost).del();
    await knex('HidePosts').where({ 'idUser': idUser, 'idPosts':idPost }).del();
  });

  test('addHidePost throws exception if idPost undefined', async () => {
    try {
      const idUser = await dbLib.addUser(db, testUser);
      await dbLib.addHidePost(db, idUser, undefined);
      await knex('Posts').where('idPosts', idPost).del();
      await knex('HidePosts').where({ 'idUser': idUser, 'idPosts': idPost }).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllHiddenPostsOfUser', () => {
  let testUser1, testUser2, testGroup, testPost1, testPost2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_post@gmail.com',
      username: 'testuser1_post',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_post@gmail.com',
      username: 'testuser2_post',
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
    await knex('Users').where('username', 'testuser1_post').del();
    await knex('Users').where('username', 'testuser2_post').del();
    await knex('Groups').where('groupName', 'testgroup_post').del();
  });
  test('getAllHiddenPostsOfUser get all the posts a user hide', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost1 = {
      idUser: idUser1,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post1',
      content: '500 character limit post',
      attachment: null
    };
    testPost2 = {
      idUser: idUser1,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post2',
      content: '500 character limit post',
      attachment: null
    };
    const idPost1 = await dbLib.addPost(db, testPost1);
    const idPost2 = await dbLib.addPost(db, testPost2);
    await dbLib.addHidePost(db, idUser1, idPost1);
    await dbLib.addHidePost(db, idUser1, idPost2);
    await dbLib.addHidePost(db, idUser2, idPost2);
    const relation = await dbLib.getAllHiddenPostsOfUser(db, idUser1);
    expect(relation.length).toBe(2);
    await knex('Posts').where('idPosts', idPost1).del();
    await knex('Posts').where('idPosts', idPost2).del();
    await knex('HidePosts').where({ 'idUser': idUser1, 'idPosts': idPost1 }).del();
    await knex('HidePosts').where({ 'idUser': idUser1, 'idPosts': idPost2 }).del();
    await knex('HidePosts').where({ 'idUser': idUser2, 'idPosts': idPost2 }).del();
  });
  test('getAllHiddenPostsOfUser throws exception if idUser undefined', async () => {
    try {
      await dbLib.getAllHiddenPostsOfUser(db, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllHiddenPostOfGroup', () => {

  let testUser, testGroup, testPost, idUser, idGroup, idPost, idHidePost;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(async () => {
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
    idUser = await dbLib.addUser(db, testUser);
    idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: true,
      title: 'This is a test post',
      content: '500 character limit post',
      attachment: null
    };
    idPost = await dbLib.addPost(db, testPost);
    idUser_Group = await dbLib.addUserToGroup(db, {idUser: idUser, idGroup: idGroup, role: 'user'});
    idHidePost = await dbLib.addHidePost(db, idUser, idPost);
  });
  afterEach(async () => {
    await knex('Users').where('idUsers', idUser).del();
    await knex('Groups').where('idGroups', idGroup).del();
    await knex('Posts').where('idPosts', idPost).del();
    await knex('HidePosts').where('idHidePosts', idHidePost).del();
  });

  afterEach(async () => {
    await knex('Groups').where('groupName', testGroup.groupName).del();
  });

  test('getAllHiddenPostOfGroup retrieves hidden posts in the group', async () => {
    const hidePosts = await dbLib.getAllHiddenPostOfGroup(db, idGroup);
    expect(hidePosts.length).toBe(1);
    expect(hidePosts[0].idPosts).toBe(idPost);
  });
});
