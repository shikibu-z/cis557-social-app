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

describe('Database operation: addPost', () => {
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

  test('addPost adds a post', async () => {
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
    const post = await knex('Posts').where('idPosts', idPost);
    expect(post[0].idPosts).toBe(idPost);
    await knex('Posts').where('idPosts', idPost).del();
  });

  test('addPost throws exception if post maldefined', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: null,
      content: '500 character limit post',
      attachment: null
    }
    try {
      const idPost = await dbLib.addPost(db, testPost);
      await knex('Posts').where('idPosts', idPost).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getPost', () => {
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

  test('getPost gets a post by id', async () => {
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
    const post = await dbLib.getPost(db, idPost);
    expect(post.idPosts).toBe(idPost);
    await knex('Posts').where('idPosts', idPost).del();
  });
});

describe('Database operation: getAllPostsOfGroup', () => {
  let testUser, testGroup1, testGroup2, testPost1, testPost2, testPost3;
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
    testGroup1 = {
      groupName: 'testgroup1_post',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2_post',
      private: false,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_post').del();
    await knex('Groups').where('groupName', 'testgroup1_post').del();
    await knex('Groups').where('groupName', 'testgroup2_post').del();
  });

  test('getAllPostsOfGroup gets all posts in a group ordered by timestamp', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup1 = await dbLib.addGroup(db, testGroup1);
    const idGroup2 = await dbLib.addGroup(db, testGroup2);
    testPost1 = {
      idUser: idUser,
      idGroup: idGroup1,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post1',
      content: '500 character limit post',
      attachment: null
    };
    testPost2 = {
      idUser: idUser,
      idGroup: idGroup2,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post2',
      content: '500 character limit post',
      attachment: null
    };
    testPost3 = {
      idUser: idUser,
      idGroup: idGroup1,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post3',
      content: '500 character limit post',
      attachment: null
    };
    const idPost1 = await dbLib.addPost(db, testPost1);
    const idPost2 = await dbLib.addPost(db, testPost2);
    const idPost3 = await dbLib.addPost(db, testPost3);
    const posts = await dbLib.getAllPostsOfGroup(db, idGroup1);
    expect(posts.length).toBe(2);
    expect(posts[0].idPosts).toBe(idPost3);
    expect(posts[1].idPosts).toBe(idPost1);
    await knex('Posts').where('idPosts', idPost1).del();
    await knex('Posts').where('idPosts', idPost2).del();
    await knex('Posts').where('idPosts', idPost3).del();
  });
});

describe('Database operation: updatePost', () => {
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

  test('updatePost updates flagged status', async () => {
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
    await dbLib.updatePost(db, idPost, true);
    const post = await knex('Posts').where('idPosts', idPost);
    expect(post[0].flagged).toBe(1);
    await knex('Posts').where('idPosts', idPost).del();
  });

  test('updatePost throws exception if idPost invalid', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    try {
      await dbLib.updatePost(db, undefined, true);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: deletePost', () => {
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

  test('deletePost delets a post', async () => {
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
    await dbLib.deletePost(db, idPost);
    const post = await knex('Posts').where('idPosts', idPost);
    expect(post.length).toBe(0);
    await knex('Posts').where('idPosts', idPost).del();
  });

  test('deletePost throws exception if idPost invalid', async () => {
    try {
      await dbLib.deletePost(db, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllFlaggedPostOfGroup', () => {
  let testUser, testGroup1, testGroup2, testPost1, testPost2, testPost3, idUser, idGroup1, idGroup2, idPost1, idPost2, idPost3;
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
    testGroup1 = {
      groupName: 'testgroup1_post',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2_post',
      private: false,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('idUsers', idUser).del();
    await knex('Groups').where('idGroups', idGroup1).del();
    await knex('Groups').where('idGroups', idGroup2).del();
  });

  test('getAllFlaggedPostsOfGroup gets all flagged posts in a group ordered by timestamp', async () => {
    idUser = await dbLib.addUser(db, testUser);
    idGroup1 = await dbLib.addGroup(db, testGroup1);
    idGroup2 = await dbLib.addGroup(db, testGroup2);
    testPost1 = {
      idUser: idUser,
      idGroup: idGroup1,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post1',
      content: '500 character limit post',
      attachment: null
    };
    testPost2 = {
      idUser: idUser,
      idGroup: idGroup1,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: true,
      title: 'This is a test post2',
      content: '500 character limit post',
      attachment: null
    };
    testPost3 = {
      idUser: idUser,
      idGroup: idGroup1,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      flagged: true,
      title: 'This is a test post3',
      content: '500 character limit post',
      attachment: null
    };
    idPost1 = await dbLib.addPost(db, testPost1);
    idPost2 = await dbLib.addPost(db, testPost2);
    idPost3 = await dbLib.addPost(db, testPost3);
    const posts = await dbLib.getAllFlaggedPostOfGroup(db, idGroup1);
    expect(posts.length).toBe(2);
    expect(posts[0].idPosts).toBe(idPost2);
    expect(posts[1].idPosts).toBe(idPost3);
    await knex('Posts').where('idPosts', idPost1).del();
    await knex('Posts').where('idPosts', idPost2).del();
    await knex('Posts').where('idPosts', idPost3).del();
  });
});