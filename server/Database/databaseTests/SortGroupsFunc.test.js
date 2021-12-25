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

describe('Database operation: sortGroupsByNumberOfUsers', () => {
  let testUser1, testUser2, testUser3, testGroup1, testGroup2, testGroup3;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_sortgroup@gmail.com',
      username: 'testuser1_sortgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_sortgroup@gmail.com',
      username: 'testuser2_sortgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser3 = {
      email: 'testuser3_sortgroup@gmail.com',
      username: 'testuser3_sortgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup1 = {
      groupName: 'testgroup1_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup3 = {
      groupName: 'testgroup3_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_sortgroup').del();
    await knex('Users').where('username', 'testuser2_sortgroup').del();
    await knex('Users').where('username', 'testuser3_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup1_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup2_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup3_sortgroup').del();
  });

  test('sortGroupsByNumberOfUsers sort the groups from the most users to least users', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idUser3 = await dbLib.addUser(db, testUser3);
    const idGroup1 = await dbLib.addGroup(db, testGroup1);
    const idGroup2 = await dbLib.addGroup(db, testGroup2);
    const idGroup3 = await dbLib.addGroup(db, testGroup3);
    testRelation1 = {
      idUser: idUser1,
      idGroup: idGroup1,
      role: 'admin',
    }
    testRelation2 = {
      idUser: idUser2,
      idGroup: idGroup1,
      role: 'admin',
    }
    testRelation3 = {
      idUser: idUser1,
      idGroup: idGroup2,
      role: 'admin',
    }
    testRelation4 = {
      idUser: idUser2,
      idGroup: idGroup2,
      role: 'admin',
    }
    testRelation5 = {
      idUser: idUser3,
      idGroup: idGroup2,
      role: 'admin',
    }
    testRelation6 = {
      idUser: idUser2,
      idGroup: idGroup3,
      role: 'admin',
    }
    await dbLib.addUserToGroup(db, testRelation1);
    await dbLib.addUserToGroup(db, testRelation2);
    await dbLib.addUserToGroup(db, testRelation3);
    await dbLib.addUserToGroup(db, testRelation4);
    await dbLib.addUserToGroup(db, testRelation5);
    await dbLib.addUserToGroup(db, testRelation6);
    const groups = await dbLib.sortGroupsByNumberOfUsers(db, [idGroup1, idGroup2, idGroup3]);
    expect(groups[0].idGroups).toBe(idGroup2);
    expect(groups[1].idGroups).toBe(idGroup1);
    expect(groups[2].idGroups).toBe(idGroup3);
    await knex('User_Group').where({ 'idUser': idUser1, 'idGroup': idGroup1 }).del();
    await knex('User_Group').where({ 'idUser': idUser2, 'idGroup': idGroup1 }).del();
    await knex('User_Group').where({ 'idUser': idUser1, 'idGroup': idGroup2 }).del();
    await knex('User_Group').where({ 'idUser': idUser2, 'idGroup': idGroup2 }).del();
    await knex('User_Group').where({ 'idUser': idUser3, 'idGroup': idGroup2 }).del();
    await knex('User_Group').where({ 'idUser': idUser2, 'idGroup': idGroup3 }).del();
  });
  test('sortGroupsByNumberOfUsers throws exception if list of groups passed is null', async () => {
    try {
      await dbLib.sortGroupsByNumberOfUsers(db, null);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: sortGroupsByNumberOfPosts', () => {
  let testUser1, testGroup1, testGroup2, testGroup3, testPost1, testPost2, testPost3, testPost4, testPost5, testPost6;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_sortgroup@gmail.com',
      username: 'testuser1_sortgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup1 = {
      groupName: 'testgroup1_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup3 = {
      groupName: 'testgroup3_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup1_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup2_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup3_sortgroup').del();
  });
  test('sortGroupsByNumberOfPosts sort the groups from the most posts to least posts', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup1 = await dbLib.addGroup(db, testGroup1);
    const idGroup2 = await dbLib.addGroup(db, testGroup2);
    const idGroup3 = await dbLib.addGroup(db, testGroup3);
    testPost1 = {
      idUser: idUser1,
      idGroup: idGroup1,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post1',
      content: '500 character limit post',
      attachment: null
    };
    testPost2 = {
      idUser: idUser1,
      idGroup: idGroup1,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post2',
      content: '500 character limit post',
      attachment: null
    };
    testPost3 = {
      idUser: idUser1,
      idGroup: idGroup2,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post3',
      content: '500 character limit post',
      attachment: null
    };
    testPost4 = {
      idUser: idUser1,
      idGroup: idGroup2,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post4',
      content: '500 character limit post',
      attachment: null
    };
    testPost5 = {
      idUser: idUser1,
      idGroup: idGroup2,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post5',
      content: '500 character limit post',
      attachment: null
    };
    testPost6 = {
      idUser: idUser1,
      idGroup: idGroup3,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post6',
      content: '500 character limit post',
      attachment: null
    };
    const idPost1 = await dbLib.addPost(db, testPost1);
    const idPost2 = await dbLib.addPost(db, testPost2);
    const idPost3 = await dbLib.addPost(db, testPost3);
    const idPost4 = await dbLib.addPost(db, testPost4);
    const idPost5 = await dbLib.addPost(db, testPost5);
    const idPost6 = await dbLib.addPost(db, testPost6);
    const groups = await dbLib.sortGroupsByNumberOfPosts(db, [idGroup1, idGroup2, idGroup3]);
    expect(groups[0].idGroups).toBe(idGroup2);
    expect(groups[1].idGroups).toBe(idGroup1);
    expect(groups[2].idGroups).toBe(idGroup3);
    await knex('Posts').where('idPosts', idPost1).del();
    await knex('Posts').where('idPosts', idPost2).del();
    await knex('Posts').where('idPosts', idPost3).del();
    await knex('Posts').where('idPosts', idPost4).del();
    await knex('Posts').where('idPosts', idPost5).del();
    await knex('Posts').where('idPosts', idPost6).del();
  });
});

describe('Database operation: sortGroupsByLatestPosts', () => {
  let testUser1, testGroup1, testGroup2, testGroup3, testPost1, testPost2, testPost3;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_sortgroup@gmail.com',
      username: 'testuser1_sortgroup',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup1 = {
      groupName: 'testgroup1_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup3 = {
      groupName: 'testgroup3_sortgroup',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup1_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup2_sortgroup').del();
    await knex('Groups').where('groupName', 'testgroup3_sortgroup').del();
  });
  test('sortGroupsByNumberOfPosts sort the groups from the most posts to least posts', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup1 = await dbLib.addGroup(db, testGroup1);
    const idGroup2 = await dbLib.addGroup(db, testGroup2);
    const idGroup3 = await dbLib.addGroup(db, testGroup3);
    testPost1 = {
      idUser: idUser1,
      idGroup: idGroup1,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post1',
      content: '500 character limit post',
      attachment: null
    };
    testPost2 = {
      idUser: idUser1,
      idGroup: idGroup2,
      timestamp: new Date((new Date()).getTime() + 172800000).toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post2',
      content: '500 character limit post',
      attachment: null
    };
    testPost3 = {
      idUser: idUser1,
      idGroup: idGroup3,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post3',
      content: '500 character limit post',
      attachment: null
    };
    const idPost1 = await dbLib.addPost(db, testPost1);
    const idPost2 = await dbLib.addPost(db, testPost2);
    const idPost3 = await dbLib.addPost(db, testPost3);
    const groups = await dbLib.sortGroupsByLatestPosts(db, [idGroup1, idGroup2, idGroup3]);
    expect(groups[0].idGroups).toBe(idGroup2);
    expect(groups[1].idGroups).toBe(idGroup3);
    expect(groups[2].idGroups).toBe(idGroup1);
    await knex('Posts').where('idPosts', idPost1).del();
    await knex('Posts').where('idPosts', idPost2).del();
    await knex('Posts').where('idPosts', idPost3).del();
  });
});