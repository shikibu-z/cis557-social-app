const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: 'database-final-project.chznisicdfbc.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'cis557_group5',
    database: 'app',
  },
});

const request = require('supertest');

const dbLib = require('./Database/dbOperationMySQL');

let db;
const webapp = require('./server');

const encrypt = require('./encryptHelper');

beforeAll(async () => {
  db = await dbLib.connect();
  // await knex('Users').del();
  // await knex('User_Topic').del();
  // await knex('Topics').del();
});

afterAll(async () => {
  // await knex('Users').del();
  // await knex('User_Topic').del();
  // await knex('Topics').del();
  await db.end();
})

describe('Server Endpoint test: registration', () => {
  let idUser, testuser1;
  beforeAll(() => {
    testuser1 = {
      username: 'testuser_create1',
      email: 'test1@testcreate.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password: '12345',
    };
  })

  afterAll(async () => {
    await knex('Users').where('username', testuser1.username).del();
  });

  test('Register successfully', async () => {
    await request(webapp).post(`/api/registration`).send(testuser1)
      .expect(201) // testing the response status code
      .then(async (response) => {
        idUser = response.body.id;
        expect(response.body).not.toBeNull();
        const user = await knex('Users').select().where('idUsers', '=', `${response.body.id}`);
        expect(user[0].username).toBe('testuser_create1');
      });
  });

  test('Register with exist username', async () => {
    await request(webapp).post(`/api/registration`).send(testuser1)
      .expect(409) // testing the response status code
      .then((response) => {
        expect(response.body.error).toBe('The item already exist');
      });
  });
});

describe('Server Endpoint test: reset password', () => {
  let idUser;
  beforeEach(async () => {
    const testuser1 = {
      username: 'testuser_reset1',
      email: 'test1@testcreate.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password: '12345',
    };
    const info = await request(webapp).post('/api/registration').send(testuser1);
    idUser = info.body.id;
  })


  afterEach(async () => {
    await knex('Users').where('username', 'testuser_reset1').del();
  });

  test('Reset successfully', async () => {
    const resetInfo = {
      email: 'test1@testcreate.com',
      username: 'testuser_reset1',
      password: '123456'
    };
    await request(webapp).put(`/api/resetPassword`).send(resetInfo)
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).toBe(1);
        const updateAuth = await knex('Authentication').select().where('idUsers', '=', `${idUser}`);
        expect(await encrypt.checkPassword(resetInfo.password, updateAuth[0].password_hash)).toBe(true);
      });
  });

  test('Invalid username', async () => {
    // await request(webapp).post('/api/registration').send(testuser1);
    const resetInfo = {
      email: 'test1@testcreate.com',
      username: 'testuser_reset',
      password: '123456'
    };
    await request(webapp).put(`/api/resetPassword`).send(resetInfo)
      .expect(404) // testing the response status code
  });

  test('Invalid email', async () => {
    // await request(webapp).post('/api/registration').send(testuser1);
    const resetInfo = {
      email: 'test1@testcreate',
      username: 'testuser_reset1',
      password: '123456'
    };
    await request(webapp).put(`/api/resetPassword`).send(resetInfo)
      .expect(401) // testing the response status code
  });

  test('Request w/o email', async () => {
    // await request(webapp).post('/api/registration').send(testuser1);
    const resetInfo = {
      username: 'testuser_reset1',
      password: '123456'
    };
    await request(webapp).put(`/api/resetPassword`).send(resetInfo)
      .expect(400) // testing the response status code
      .then((response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: login', () => {
  let id1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    id1 = await dbLib.addUser(db, testuser1);
  })

  afterAll(async () => {
    await knex('Users').where('idUsers', `${id1}`).del();
  });

  test('Login successfully', async () => {
    const login = {
      username: 'testuser_update1',
      password: '123456'
    }
    await request(webapp).post(`/api/login`).send(login)
      .expect(200) // testing the response status code
      .then((response) => {
        expect(response.body.id).toBe(id1);
      });
  });

  test('Login with wrong password', async () => {
    const login = {
      username: 'testuser_update1',
      password: '12345'
    }
    await request(webapp).post(`/api/login`).send(login)
      .expect(401) // testing the response status code
      .then((response) => {
        expect(response.body.error).toBe('Invalid username or password');
      });
  });

  test('Login with wrong username', async () => {
    const login = {
      username: 'testuser_update',
      password: '123456'
    }
    await request(webapp).post(`/api/login`).send(login)
      .expect(401) // testing the response status code
      .then((response) => {
        expect(response.body.error).toBe('Invalid username or password');
      });
  });

  test('Login w/o username', async () => {
    const login = {
      password: '123456'
    }
    await request(webapp).post(`/api/login`).send(login)
      .expect(401) // testing the response status code
      .then((response) => {
        expect(response.body.error).toBe('Invalid username or password');
      });
  });
});

describe('Server Endpoint test: get profile test', () => {
  let id;
  beforeEach(async () => {
    const testuser = {
      username: 'testuser3',
      email: 'test_profile@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    id = await dbLib.addUser(db, testuser);
  });

  afterEach(async () => {
    await knex('Users').where('idUsers', '=', `${id}`).del();
  });
  test('Get profile normal test', () => {
    request(webapp).get(`/api/profile/${id}`).send()
      .expect(200) // testing the response status code
      .then((response) => {
        expect(response.body).not.toBeNull();
        expect(response.body.username).toBe('testuser3');
      });
  });
});

describe('Server Endpoint test: Update profile test', () => {
  let id1;
  // let id2;
  let testuser1;
  // let testuser2;
  beforeEach(async () => {
    testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    let password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    id1 = await dbLib.addUser(db, testuser1);
  });

  afterEach(async () => {
    await knex('Users').where('idUsers', `${id1}`).del();
  });

  afterAll(async () => {
    await knex('Topics').where('topic', 'topic_update3').del();
  });

  test('Update profile normal test with tags w/o password change', async () => {
    const updateProfile = {
      oldPassword: '',
      newPassword: '',
      tag: ['topic_update3'],
      photo: ''
    }
    let topic = await knex('User_Topic').select().where('idUser', '=', `${id1}`);
    expect(topic.length).toBe(0);
    await request(webapp).put(`/api/profile/${id1}/edit`).send(updateProfile)
      .expect(200) // testing the response status code
      .then(async () => {
        topic = await knex('User_Topic').select().where('idUser', '=', `${id1}`);
        expect(topic.length).toBe(1);
      });
  });

  test('Update profile normal test with w/o tags but correct password change', async () => {
    const updateProfile = {
      oldPassword: '123456',
      newPassword: '1',
      tag: [],
      photo: ''
    }
    await request(webapp).put(`/api/profile/${id1}/edit`).send(updateProfile)
      .expect(200) // testing the response status code
      .then(async () => {
        const updateAuth = await knex('Authentication').select().where('idUsers', '=', `${id1}`);
        expect(await encrypt.checkPassword(updateProfile.newPassword, updateAuth[0].password_hash)).toBe(true);
      });
  });

  test('Update profile normal test with w/o tags but wrong password change', async () => {
    const updateProfile = {
      oldPassword: '12345',
      newPassword: '1',
      tag: [],
      photo: ''
    }
    await request(webapp).put(`/api/profile/${id1}/edit`).send(updateProfile)
      .expect(401) // testing the response status code
  });
});

describe('Server Endpoint test: delete account', () => {
  let id1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    id1 = await dbLib.addUser(db, testuser1);
  })

  afterEach(async () => {
    await knex('Users').where('idUsers', '=', `${id1}`).del();
  });

  test('Delete successfully', async () => {
    const req = {
      id: id1,
    }
    await request(webapp).delete(`/api/deleteAccount`).send(req)
      .expect(200) // testing the response status code
      .then((response) => {
        expect(response.body).toBe(1);
      });
  });

  test('Delete w/o id', async () => {
    await request(webapp).delete(`/api/deleteAccount`).send()
      .expect(400) // testing the response status code
      .then((response) => {
        expect(response.body.error).toBe('Missing id');
      });
  });
});

describe('Server Endpoint test: group creation', () => {
  let id, idGroup;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  testUser = {
    email: 'testuser@gmail.com',
    username: 'testuser',
    password_hash: 'asdzxc',
    registrationDate: datetime,
    gender: 'female',
    profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
  }

  beforeEach(async () => {
    id = await dbLib.addUser(db, testUser);
  });

  afterEach(async () => {
    await knex('Groups').where('idGroups', '=', `${idGroup}`).del();
    await knex('Users').where('idUsers', '=', `${id}`).del();
  });

  afterAll(async () => {
    await knex('Topics').where('topic', 'gTag1').del();
    await knex('Topics').where('topic', 'gTag2').del();
  });

  test('Create public group successfully', async () => {
    const publicGroup = {
      groupName: 'testGroupPublic',
      private: 0,
      groupIntro: 'some intro',
      profilePhoto: '',
      userid: id,
      groupTags: ['gTag1', 'gTag2'],
    }
    await request(webapp).post(`/api/groupCreation`).send(publicGroup)
      .expect(201) // testing the response status code
      .then(async (response) => {
        idGroup = response.body;
        expect(response.body).not.toBeNull();
        const group = await knex('Groups').select().where('idGroups', '=', `${response.body}`);
        expect(group[0].groupName).toBe('testGroupPublic');
      });
  });

  test('Create private group successfully', async () => {
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupIntro: 'some intro',
      profilePhoto: '',
      userid: id,
      groupTags: ['gTag1', 'gTag2'],
    }
    await request(webapp).post(`/api/groupCreation`).send(privateGroup)
      .expect(201) // testing the response status code
      .then(async (response) => {
        idGroup = response.body;
        expect(response.body).not.toBeNull();
        const group = await knex('Groups').select().where('idGroups', '=', `${response.body}`);
        expect(group[0].groupName).toBe('testGroupPrivate');
        const topics = await knex('Group_Topic').select().where('idGroup', '=', `${response.body}`);
        expect(topics.length).toBe(2);
      });
  });

  test('Create group with exists name', async () => {
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupIntro: 'some intro',
      profilePhoto: '',
      userid: id,
      groupTags: ['gTag1', 'gTag2'],
    }
    await request(webapp).post(`/api/groupCreation`).send(privateGroup)
      .expect(201) // testing the response status code
      .then(async (response) => {
        idGroup = response.body;
      });
    await request(webapp).post(`/api/groupCreation`).send(privateGroup)
      .expect(404) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
      });
  });
});

describe('Server Endpoint test: Add administrator', () => {
  let uid1;
  let uid2;
  let gid1;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeAll(async () => {
    testUser1 = {
      email: 'testuser1@gmail.com',
      username: 'testuser1',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
    testUser2 = {
      email: 'testuser2@gmail.com',
      username: 'testuser2',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
    uid1 = await dbLib.addUser(db, testUser1);

    uid2 = await dbLib.addUser(db, testUser2);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
      userid: uid1,
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    const user_group = {
      idUser: uid2,
      idGroup: gid1,
      role: 'admin'
    }
    await knex.insert(user_group).into('User_Group');
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid2}`).del();
  });

  test('Add admin to group successfully', async () => {
    await request(webapp).post(`/api/addAdmin`).send({ groupId: gid1, userId: uid2 })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const notis = await dbLib.getAllNotificationsOfUser(db, uid1);
        expect(notis.length).toBe(0);
      });
  });

  test('Missing userId', async () => {
    await request(webapp).post(`/api/addAdmin`).send({ groupId: gid1 })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });

  test('Missing groupId', async () => {
    await request(webapp).post(`/api/addAdmin`).send({ userId: uid1 })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: Remove administrator', () => {
  let uid1;
  let uid2;
  let gid1;
  beforeAll(async () => {
    const testUser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    testUser2 = {
      email: 'testuser2@gmail.com',
      username: 'testuser2',
      password_hash: 'asdzxc',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    }
    uid1 = await dbLib.addUser(db, testUser1);
    uid2 = await dbLib.addUser(db, testUser2);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    const user_group = {
      idUser: uid2,
      idGroup: gid1,
      role: 'admin'
    }
    await knex.insert(user_group).into('User_Group');
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid2}`).del();
  });

  test('Remove admin of a group successfully', async () => {
    await request(webapp).put(`/api/removeAdmin`).send({ groupId: gid1, userId: uid2 })
      .expect(201) // testing the response status code
  });

  test('Missing userId', async () => {
    await request(webapp).put(`/api/removeAdmin`).send({ groupId: gid1 })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });

  test('Missing groupId', async () => {
    await request(webapp).put(`/api/removeAdmin`).send({ userId: uid2 })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: get admins', () => {
  let uid1;
  let uid2;
  let gid1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    let password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const testuser2 = {
      username: 'testuser_update2',
      email: 'test2@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    password = await encrypt.hashPassword('123456');
    testuser2.password_hash = password;
    uid2 = await dbLib.addUser(db, testuser2);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
      userid: uid1
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    await knex.insert({
      idUser: uid1,
      idGroup: gid1,
      role: 'admin'
    }).into('User_Group');
    await knex.insert({
      idUser: uid2,
      idGroup: gid1,
      role: 'admin'
    }).into('User_Group');
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid2}`).del();
  });

  test('get admins', async () => {
    await request(webapp).get(`/api/getAdmins/${gid1}`).send()
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        expect(response.body.length).toBe(2);
      });
  });
});

describe('Server Endpoint test: request to join a group', () => {
  let uid1;
  let gid1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
  });

  test('Request to join a group successfully', async () => {
    await request(webapp).post(`/api/reqToJoinGroup/${gid1}`).send({ userId: uid1 })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const notis = await dbLib.getAllNotificationsOfUser(db, uid1);
        const adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, gid1);
        expect(notis.length).toBe(1);
        expect(adminNotis.length).toBe(1);
        expect(notis[0].type).toBe('join');
        expect(adminNotis[0].type).toBe('join');
      });
  });

  test('Missing userId', async () => {
    await request(webapp).post(`/api/reqToJoinGroup/${gid1}`).send({ userId: undefined })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: approve/decline request to join a group', () => {
  let uid1;
  let gid1;
  let adminNotiId;
  let notiId;

  beforeEach(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    adminNotiId = await dbLib.addAdminNotification(db, {
      idGroup: gid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: `request to join the group`,
      idUser_Action: uid1,
      idPost_Action: null
    });
    notiId = await dbLib.addNotification(db, {
      idUser: uid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: 'Apply to join group',
      idUser_Action: uid1,
      idGroup_Action: gid1
    });
  });

  afterEach(async () => {
    await knex('AdminNotifications').where('idAdminNotifications', '=', `${adminNotiId}`).del();
    await knex('Notifications').where('idNotifications', '=', `${notiId}`).del();
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
  });

  test('Decline a request successfully', async () => {
    await request(webapp).put(`/api/solveJoinRequest/${adminNotiId}`).send({ groupId: gid1, userId: uid1, approve: false })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const usersInGroup = await dbLib.getAllUsersFromGroup(db, gid1);
        expect(usersInGroup.length).toBe(0);
      });
  });

  test('Approve a request successfully', async () => {
    await request(webapp).put(`/api/solveJoinRequest/${adminNotiId}`).send({ groupId: gid1, userId: uid1, approve: 1 })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const usersInGroup = await dbLib.getAllUsersFromGroup(db, gid1);
        expect(usersInGroup.length).toBe(1);
      });
  });

  test('Missing userId', async () => {
    await request(webapp).post(`/api/reqToJoinGroup/${gid1}`).send({ userId: undefined })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: invite others', () => {
  let uid1;
  let uid2;
  let gid1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    let password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const testuser2 = {
      username: 'testuser_update2',
      email: 'test2@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    password = await encrypt.hashPassword('123456');
    testuser2.password_hash = password;
    uid2 = await dbLib.addUser(db, testuser2);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 0,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    await knex.insert({
      idUser: uid1,
      idGroup: gid1,
      role: 'member'
    }).into('User_Group');
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid2}`).del();
  });

  test('Invite user to join a group successfully', async () => {
    await request(webapp).post(`/api/invite`).send({ senderId: uid1, receiverId: uid2, groupId: gid1 })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        let notis = await dbLib.getAllNotificationsOfUser(db, uid1);
        expect(notis.length).toBe(1);
        notis = await dbLib.getAllNotificationsOfUser(db, uid2);
        expect(notis.length).toBe(1);
      });
  });
});

// TODO: test solve initation
describe('Server Endpoint test: accept/decline invitation to join a group', () => {
  let uid1;
  let uid2;
  let gid1;
  let notiId;

  beforeEach(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    let password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const testuser2 = {
      username: 'testuser_update2',
      email: 'test2@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    password = await encrypt.hashPassword('123456');
    testuser2.password_hash = password;
    uid2 = await dbLib.addUser(db, testuser2);
    const publicGroup = {
      groupName: 'testGroupPublic',
      private: 0,
      groupIntro: 'some intro',
      profilePhoto: '',
      userid: uid2,
      groupTags: ['gTag1', 'gTag2'],
    }
    const response = await request(webapp).post(`/api/groupCreation`).send(publicGroup);
    gid1 = response.body;
    notiId = await dbLib.addNotification(db, {
      idUser: uid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'invite',
      action: 'invite to join group',
      idUser_Action: uid2,
      idGroup_Action: gid1
    });
  });

  afterEach(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid2}`).del();
  });

  test('Decline an invitation successfully', async () => {
    await request(webapp).put(`/api/solveInvitation`).send({ notiId: notiId, groupId: gid1, userId: uid1, approve: false })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const usersInGroup = await dbLib.getAllUsersFromGroup(db, gid1);
        expect(usersInGroup.length).toBe(1);
      });
  });

  test('Approve an invitation successfully', async () => {
    await request(webapp).put(`/api/solveInvitation`).send({ notiId: notiId, groupId: gid1, userId: uid1, approve: true })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const usersInGroup = await dbLib.getAllUsersFromGroup(db, gid1);
        expect(usersInGroup.length).toBe(1);
      });
  });

  test('Missing userId', async () => {
    await request(webapp).put(`/api/solveInvitation`).send({ notiId: notiId, groupId: gid1, userId: undefined, approve: true })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: leave a group', () => {
  let uid1;
  let gid1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    await knex.insert({
      idUser: uid1,
      idGroup: gid1,
      role: 'member'
    }).into('User_Group');
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
  });

  test('Leave a group successfully', async () => {
    await request(webapp).delete(`/api/leaveGroup/${gid1}`).send({ userId: uid1 })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, gid1);
        expect(adminNotis.length).toBe(1);
        expect(adminNotis[0].type).toBe('leave');
        const usersInGroup = await dbLib.getAllUsersFromGroup(db, gid1);
        expect(usersInGroup.length).toBe(0);
      });
  });

  test('Missing userId', async () => {
    await request(webapp).post(`/api/reqToJoinGroup/${gid1}`).send({ userId: undefined })
      .expect(400) // testing the response status code
      .then(async (response) => {
        expect(response.body.error).toBe('Bad request');
      });
  });
});

describe('Server Endpoint test: get notifications for a user', () => {
  let uid1;
  let gid1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_create1',
      email: 'test1@testcreate.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password: '12345',
    };
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
  })

  beforeEach(async () => {
    await dbLib.addNotification(db, {
      idUser: uid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'invite others',
      action: `You have`,
      idUser_Action: uid1,
      idGroup_Action: gid1
    });
    await dbLib.addNotification(db, {
      idUser: uid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'invite',
      action: `You are`,
      idUser_Action: uid1,
      idGroup_Action: gid1
    });
  });

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
  });

  test('Get notifications successfully', async () => {
    await request(webapp).get(`/api/notification/${uid1}`).send()
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        expect(response.body.length).toBe(2);
      });
  });
});

describe('Server Endpoint test: get group analytics', () => {
  let id, idGroup;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  const testUser = {
    email: 'testuser@gmail.com',
    username: 'testuser',
    password_hash: 'asdzxc',
    registrationDate: datetime,
    gender: 'female',
    profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
  }

  beforeEach(async () => {
    id = await dbLib.addUser(db, testUser);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    idGroup = await dbLib.addGroup(db, privateGroup);
    const user_group = {
      idUser: id,
      idGroup: idGroup,
      role: 'creator'
    }
    await knex.insert(user_group).into('User_Group');
  });

  afterEach(async () => {
    await knex('Groups').where('idGroups', '=', `${idGroup}`).del();
    await knex('Users').where('idUsers', '=', `${id}`).del();
  });

  test('Get analytics successfully', async () => {
    await request(webapp).get(`/api/analytics/${idGroup}`).send()
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        expect(response.body.memberCount).toBe(1);
        expect(response.body.deleted).toBe(0);
        expect(response.body.postCount).toBe(0);
        expect(response.body.hidden).toBe(0);
        expect(response.body.flagged).toBe(0);
      });
  });
});

describe('Server Endpoint test: mention user in group', () => {
  let id, idGroup;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  const testUser = {
    email: 'testuser@gmail.com',
    username: 'testuser',
    password_hash: 'asdzxc',
    registrationDate: datetime,
    gender: 'female',
    profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
  }

  beforeEach(async () => {
    id = await dbLib.addUser(db, testUser);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    idGroup = await dbLib.addGroup(db, privateGroup);
    const user_group = {
      idUser: id,
      idGroup: idGroup,
      role: 'creator'
    }
    await knex.insert(user_group).into('User_Group');
  });

  afterEach(async () => {
    await knex('Groups').where('idGroups', '=', `${idGroup}`).del();
    await knex('Users').where('idUsers', '=', `${id}`).del();
  });

  test('mention user successfully', async () => {
    await request(webapp).post(`/api/mention/${idGroup}/${id}`).send({ userId: id })
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        const notis = await knex('Notifications').where('idUser', '=', `${id}`)
        expect(notis.length).toBe(1);
      });
  });
});
describe('Server Endpoint test: get public groups', () => {
  let gid1;
  let gid2;
  let gid3;
  beforeAll(async () => {
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    const publicGroup = {
      groupName: 'testGroupPublic',
      private: 0,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid2 = await dbLib.addGroup(db, publicGroup);
    const publicGroup2 = {
      groupName: 'testGroupPublic2',
      private: 0,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid3 = await dbLib.addGroup(db, publicGroup2);
  })

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Groups').where('idGroups', '=', `${gid2}`).del();
    await knex('Groups').where('idGroups', '=', `${gid3}`).del();
  });

  test('Get public groups successfully', async () => {
    await request(webapp).get(`/api/getGroups`).send()
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        expect(response.body.length >= 2).toBe(true);
      });
  });
});

describe('Server Endpoint test: get notifications for a group', () => {
  let uid1;
  let gid1;
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_create1',
      email: 'test1@testcreate.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password: '12345',
    };
    const password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 1,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
  })

  beforeEach(async () => {
    await dbLib.addAdminNotification(db, {
      idGroup: gid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: `You have`,
      idUser_Action: uid1,
      idPost_Action: null
    });
    await dbLib.addAdminNotification(db, {
      idGroup: gid1,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'leave',
      action: `You are`,
      idUser_Action: uid1,
      idPost_Action: null
    });
  });

  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
  });

  test('Get notifications successfully', async () => {
    await request(webapp).get(`/api/groupNotification/${gid1}`).send()
      .expect(200) // testing the response status code
      .then(async (response) => {
        expect(response.body).not.toBeNull();
        expect(response.body.length).toBe(2);
      });
  });
});

describe('Server Endpoint test: get friends', () => {
  let uid1;
  let uid2;
  let gid1;
  afterAll(async () => {
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Users').where('idUsers', '=', `${uid2}`).del();
  });
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    let password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const testuser2 = {
      username: 'testuser_update2',
      email: 'test2@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    password = await encrypt.hashPassword('123456');
    testuser2.password_hash = password;
    uid2 = await dbLib.addUser(db, testuser2);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 0,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    await knex.insert({
      idUser: uid1,
      idGroup: gid1,
      role: 'admin'
    }).into('User_Group');
    await knex.insert({
      idUser: uid2,
      idGroup: gid1,
      role: 'member'
    }).into('User_Group');
  });

  test('get friends successfully', async () => {
    await request(webapp).get(`/api/friends/${uid1}/${-1}`).send()
      .expect(200) // testing response status code
      .then((response) => {
        expect(response.body.length).toBe(1);
      })
  })
});

describe('Server Endpoint test: get groups by id', () => {
  let uid1;
  let gid1;
  afterAll(async () => {
    await knex('Users').where('idUsers', '=', `${uid1}`).del();
    await knex('Groups').where('idGroups', '=', `${gid1}`).del();
  });
  beforeAll(async () => {
    const testuser1 = {
      username: 'testuser_update1',
      email: 'test1@test.com',
      registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      gender: 'male',
      profilePhoto: '',
      password_hash: '123456',
    }
    let password = await encrypt.hashPassword('123456');
    testuser1.password_hash = password;
    uid1 = await dbLib.addUser(db, testuser1);
    const privateGroup = {
      groupName: 'testGroupPrivate',
      private: 0,
      groupInfo: 'some intro',
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: '',
    }
    gid1 = await dbLib.addGroup(db, privateGroup);
    await knex.insert({
      idUser: uid1,
      idGroup: gid1,
      role: 'admin'
    }).into('User_Group');
  });

  test('get groups successfully', async () => {
    await request(webapp).get(`/api/groupsbyId/${uid1}`).send()
      .expect(200) // testing response status code
      .then((res) => {
        expect(res.body.length).toBe(1);
      });
  })
});

describe('Server Endpoint test: get topics test', () => {

  test('Get topics normal test', async () => {

    const testTopic = 'havenTopic';
    await dbLib.addTopic(db, testTopic);

    await request(webapp).get(`/api/topics`).send()
      .expect(200) // testing the response status code
      .then((response) => {
        expect(response.body).not.toBeNull();
        const topics = response.body.map(a => a.topic);
        expect(topics.includes('havenTopic')).toBe(true);
      });

    await knex('Topics').where('topic', 'havenTopic').del();
  });
});

describe('Server Endpoint test: get groups test', () => {

  test('Get groups can check num Of members, is Joined and check topic filters', async () => {
    const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
    const photo = 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/';

    const testUser1 = {
      username: 'havenUser',
      email: 'haven@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
    const testGroup = {
      groupName: 'havenGroup',
      private: 0,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: photo,
    }
    const testUser2 = {
      username: 'havenUser2',
      email: 'haven2@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testUser1.password_hash = password;
    testUser2.password_hash = password;

    await knex('Users').where('username', 'havenUser').del();
    await knex('Users').where('username', 'havenUser2').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
    await knex('Topics').where('topic', 'havenTopic').del();


    const userId1 = await dbLib.addUser(db, testUser1);
    const userId2 = await dbLib.addUser(db, testUser2);
    const groupId = await dbLib.addGroup(db, testGroup);
    await dbLib.addUserToGroup(db, { idUser: userId1, idGroup: groupId, role: 'admin' });

    await request(webapp).get(`/api/groups/${userId1}`).send()
      .expect(200)
      .then((response) => {
        // check the new created group
        expect(response.body[response.body.length - 1].numOfMembers).toBe(1);
        expect(response.body[response.body.length - 1].isJoined).toBe(true);
      });

    await request(webapp).get(`/api/groups/${userId2}`).send()
      .expect(200)
      .then((response) => {
        // check the new created group
        expect(response.body[response.body.length - 1].numOfMembers).toBe(1);
        expect(response.body[response.body.length - 1].isJoined).toBe(false);
      });

    const testTopic = 'havenTopic';
    await dbLib.addTopic(db, testTopic);
    await dbLib.addTopicToGroup(db, groupId, testTopic);
    await request(webapp).get(`/api/groups/${userId1}?havenTopic=true`).send()
      .expect(200)
      .then((response) => {
        // check the new created group
        expect(response.body[response.body.length - 1].numOfMembers).toBe(1);
        expect(response.body[response.body.length - 1].isJoined).toBe(true);
      });

    await request(webapp).get(`/api/groups/${userId1}?havenTopic2=true`).send()
      .expect(200)
      .then((response) => {
        // check the new created group
        expect(response.body.length).toBe(0);
      });

    await knex('Users').where('username', 'havenUser').del();
    await knex('Users').where('username', 'havenUser2').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
    await knex('Topics').where('topic', 'havenTopic').del();
  });

  test('Get group info can get correct info', async () => {
    const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
    const photo = 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/';

    const testUser1 = {
      username: 'havenUser',
      email: 'haven@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
    const testGroup = {
      groupName: 'havenGroup',
      private: 0,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: photo,
    }
    const testUser2 = {
      username: 'havenUser2',
      email: 'haven2@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
    const password = await encrypt.hashPassword('123456');
    testUser1.password_hash = password;
    testUser2.password_hash = password;

    const userId1 = await dbLib.addUser(db, testUser1);
    const groupId = await dbLib.addGroup(db, testGroup);
    await dbLib.addUserToGroup(db, { idUser: userId1, idGroup: groupId, role: 'admin' });
    const userId2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToGroup(db, { idUser: userId2, idGroup: groupId, role: 'member' });

    await request(webapp).get(`/api/group/${groupId}/info/${userId1}`).send()
      .expect(200)
      .then((response) => {
        expect(response.body.numOfMembers).toBe(2);
        expect(response.body.isJoined).toBe(true);
        expect(response.body.isAdmin).toBe(true);
      });

    await request(webapp).get(`/api/group/${groupId}/info/${userId2}`).send()
      .expect(200)
      .then((response) => {
        // console.log(response.body);
        expect(response.body.numOfMembers).toBe(2);
        expect(response.body.isJoined).toBe(true);
        expect(response.body.isAdmin).toBe(false);
      });

    await knex('Users').where('username', 'havenUser').del();
    await knex('Users').where('username', 'havenUser2').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
    await knex('Topics').where('topic', 'havenTopic').del();
  });
});

describe('Server Endpoint test: post tests', () => {

  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  const photo = 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/';

  const testUser = {
    username: 'havenUser',
    email: 'haven@gmail.com',
    registrationDate: datetime,
    gender: 'male',
    profilePhoto: photo,
    password_hash: '123456',
  }
  const testGroup = {
    groupName: 'havenGroup',
    private: 0,
    groupInfo: 'This is a test group.',
    createDate: datetime,
    profilePhoto: photo,
  }

  test('Post a post & get a post / get all posts correctly', async () => {

    const password = await encrypt.hashPassword('123456');
    testUser.password_hash = password;

    const userId = await dbLib.addUser(db, testUser);
    const groupId = await dbLib.addGroup(db, testGroup);

    const testPost = {
      userId: userId,
      groupId: groupId,
      flagged: 0,
      title: 'havenPost',
      content: 'this is a havenPost',
      attachment: ''
    }

    let postId = '';
    await request(webapp).post(`/api/group/${testPost.groupId}`).send(testPost)
      .expect(200)
      .then((response) => {
        postId = response.body;
      });

    await request(webapp).get(`/api/group/${groupId}/post/${postId}/${userId}`).send()
      .expect(200)
      .then((res) => {
        // console.log(res.body);
        expect(res.body.idUser).toBe(userId);
        expect(res.body.idGroup).toBe(groupId);
        expect(res.body.title).toBe('havenPost');
      })


    const testPost2 = {
      userId: userId,
      groupId: groupId,
      flagged: 0,
      title: 'havenPost2',
      content: 'this is a havenPost2',
      attachment: ''
    }

    await request(webapp).post(`/api/group/${testPost2.groupId}`).send(testPost2)
      .expect(200);

    await request(webapp).get(`/api/group/${groupId}/posts/${userId}?page=1`).send()
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(2);
      });

    await knex('Users').where('username', 'havenUser').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
    await knex('Posts').where('idUser', userId).del();
  });
});

describe('Server Endpoint test: post & comments tests', () => {
  let testUser;
  let testUser2;
  let testGroup;
  beforeAll(async () => {
    const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
    const photo = 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/';

    testUser = {
      username: 'havenUser',
      email: 'haven@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
    testGroup = {
      groupName: 'havenGroup',
      private: 0,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: photo,
    }
    testUser2 = {
      username: 'havenUser2',
      email: 'haven2@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
  });

  let userId;
  let userId2;
  let groupId;
  let postId;
  beforeEach(async () => {
    userId = await dbLib.addUser(db, testUser);
    groupId = await dbLib.addGroup(db, testGroup);
    await dbLib.addUserToGroup(db, { idUser: userId, idGroup: groupId, role: 'admin' });
    userId2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToGroup(db, { idUser: userId2, idGroup: groupId, role: 'member' });

    const testPost = {
      userId: userId,
      groupId: groupId,
      flagged: 0,
      title: 'havenPost',
      content: 'this is a havenPost',
      attachment: ''
    };
    await request(webapp).post(`/api/group/${testPost.groupId}`).send(testPost)
      .expect(200)
      .then((response) => {
        postId = response.body;
      });
  });

  afterEach(async () => {
    await knex('Users').where('username', 'havenUser').del();
    await knex('Users').where('username', 'havenUser2').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
    await knex('Posts').where('title', 'havenPost').del();
    await knex('Posts').where('title', 'havenPost2').del();
    await knex('Comments').where('content', 'havenComment').del();
    await knex('Comments').where('content', 'havenComment2').del();
    // await knex('AdminNotifications').where('content', 'havenComment2').del();
  });

  test('flag a post and send notification to admin correctly', async () => {

    await request(webapp).put(`/api/group/${groupId}/post/${postId}`).send({ flag: true, hide: false, userId: userId2 })
      .expect(200);

    const flaggedPost = await dbLib.getPost(db, postId);
    expect(flaggedPost.flagged).toBe(1);
    expect(flaggedPost.title).toBe('havenPost');

    // test admin notifications
    const adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, groupId);
    // console.log(adminNotis);
    expect(adminNotis[0].idGroup).toBe(groupId);
    expect(adminNotis[0].idUser_Action).toBe(userId2);
    expect(adminNotis[0].idPost_Action).toBe(postId);
    expect(adminNotis[0].action).toBe('havenUser2 flagged "havenPost" for deletion.');
  });

  test('hide a post correctly', async () => {

    // hide the post
    await request(webapp).put(`/api/group/${groupId}/post/${postId}`).send({ flag: false, hide: true, userId: userId2 })
      .expect(200);

    const hidePosts = await dbLib.getAllHiddenPostsOfUser(db, userId2);
    expect(hidePosts.length).toBe(1);

    // not get post is empty since testUser2 hide it
    await request(webapp).get(`/api/group/${groupId}/posts/${userId2}`).send()
      .expect(200)
      .then((response) => {
        // console.log(response.body);
        expect(response.body.length).toBe(0);
      });
  });

  test('Admin approve flag deletion and send notication correctly', async () => {

    // testUser2 flag testUser1's post
    await request(webapp).put(`/api/group/${groupId}/post/${postId}`).send({ flag: true, hide: false, userId: userId2 })
      .expect(200);


    let adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, groupId);
    expect(adminNotis[0].read_status).toBe(0);

    await request(webapp).post(`/api/solveFlagRequest/${adminNotis[0].idAdminNotifications}`)
      .send({ userIdWhoFlag: userId2, postId: postId, approve: true, adminId: userId })
      .expect(200);

    // admin notification is deleted
    adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, groupId);
    expect(adminNotis.length).toBe(0);

    // test post is deleted
    const post = await dbLib.getAllPostsOfGroup(db, groupId);
    expect(post.length).toBe(0);

    // test user & flagger receive notification
    const userNotis = await dbLib.getAllNotificationsOfUser(db, userId);
    expect(userNotis[0].action).toBe('havenUser deleted post "havenPost".');
    const flaggerNotis = await dbLib.getAllNotificationsOfUser(db, userId2);
    expect(flaggerNotis[0].action).toBe('havenUser deleted post "havenPost".');
  });

  test('Admin decline flag deletion and send notication correctly', async () => {

    // testUser2 flag testUser1's post
    await request(webapp).put(`/api/group/${groupId}/post/${postId}`).send({ flag: true, hide: false, userId: userId2 })
      .expect(200);

    let adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, groupId);
    expect(adminNotis[0].read_status).toBe(0);

    await request(webapp).post(`/api/solveFlagRequest/${adminNotis[0].idAdminNotifications}`)
      .send({ userIdWhoFlag: userId2, postId: postId, approve: false, adminId: userId })
      .expect(200);

    // admin notification is read but not deleted
    adminNotis = await dbLib.getAllAdminNotificationsOfGroup(db, groupId);
    expect(adminNotis.length).toBe(1);

    // test post is not deleted
    const post = await dbLib.getAllPostsOfGroup(db, groupId);
    expect(post.length).toBe(1);

    // test flagger receive notification
    const flaggerNotis = await dbLib.getAllNotificationsOfUser(db, userId2);
    expect(flaggerNotis[0].action).toBe('havenUser did not delete post "havenPost".');
  });

  test('Delete a post by admin and author get notified', async () => {

    // user2 post a post
    const testPost2 = {
      userId: userId2,
      groupId: groupId,
      flagged: 0,
      title: 'havenPost2',
      content: 'this is a havenPost2',
      attachment: ''
    };
    let postId2;
    await request(webapp).post(`/api/group/${testPost2.groupId}`).send(testPost2)
      .expect(200)
      .then((response) => {
        postId2 = response.body;
      });

    // delete by admin user1
    await request(webapp).delete(`/api/group/${groupId}/post/${postId2}/${userId}`)
      .expect(200);

    // test user receive notification
    const userNotis = await dbLib.getAllNotificationsOfUser(db, userId2);
    expect(userNotis[0].action).toBe('havenUser deleted post "havenPost2".');
  });

  test('Comment on a post correctly', async () => {
    // testUser2 comment on testUser1's post
    const testComment = {
      userId: userId2,
      content: 'this is havenComment2'
    }

    let commentId;
    await request(webapp).post(`/api/group/${groupId}/post/${postId}`).send(testComment)
      .expect(200)
      .then((response) => {
        commentId = response.body;
      });

    const comment = await dbLib.getAllCommentsOfPost(db, postId);
    expect(comment[0].idComments).toBe(commentId);
    expect(comment[0].content).toBe('this is havenComment2');
    expect(comment[0].idUser).toBe(userId2);
  });

  test('Get all comments correctly', async () => {
    // testUser1 comment on testUser1's post
    const testComment = {
      userId: userId,
      content: 'this is havenComment'
    }
    // testUser2 comment on testUser1's post
    const testComment2 = {
      userId: userId2,
      content: 'this is havenComment2'
    }
    await request(webapp).post(`/api/group/${groupId}/post/${postId}`).send(testComment);
    await request(webapp).post(`/api/group/${groupId}/post/${postId}`).send(testComment2);

    await request(webapp).get(`/api/group/${groupId}/post/${postId}/comments/${userId}`).send()
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(2);
      })
  });

  test('Delete a comment correctly', async () => {
    // testUser1 comment on testUser1's post
    const testComment = {
      userId: userId,
      content: 'this is havenComment'
    }
    // testUser2 comment on testUser1's post
    const testComment2 = {
      userId: userId2,
      content: 'this is havenComment2'
    }
    await request(webapp).post(`/api/group/${groupId}/post/${postId}`).send(testComment);

    let commentId2;
    await request(webapp).post(`/api/group/${groupId}/post/${postId}`).send(testComment2)
      .expect(200)
      .then((response) => {
        commentId2 = response.body;
      });


    // delete comment2
    await request(webapp).delete(`/api/group/${groupId}/post/${postId}/comment/${commentId2}`).send()
      .expect(200);

    const comments = await dbLib.getAllCommentsOfPost(db, postId);
    expect(comments.length).toBe(1);
    expect(comments[0].idUser).toBe(userId);
    expect(comments[0].content).toBe('this is havenComment');
  });
});

describe('Server Endpoint test: chat & message test', () => {

  let testUser;
  let testUser2;
  let testGroup;

  beforeAll(async () => {
    const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
    const photo = '';
    testUser = {
      username: 'havenUser',
      email: 'haven@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
    testGroup = {
      groupName: 'havenGroup',
      private: 0,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: photo,
    }
    testUser2 = {
      username: 'havenUser2',
      email: 'haven2@gmail.com',
      registrationDate: datetime,
      gender: 'male',
      profilePhoto: photo,
      password_hash: '123456',
    }
  })

  let userId;
  let userId2;
  let groupId;
  beforeEach(async () => {
    await knex('Users').where('username', 'havenUser').del();
    await knex('Users').where('username', 'havenUser2').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
    groupId = await dbLib.addGroup(db, testGroup);
    userId = await dbLib.addUser(db, testUser);
    await dbLib.addUserToGroup(db, { idUser: userId, idGroup: groupId, role: 'user' });
    userId2 = await dbLib.addUser(db, testUser2);
    await dbLib.addUserToGroup(db, { idUser: userId2, idGroup: groupId, role: 'user' });
  });

  afterEach(async () => {
    await knex('Users').where('username', 'havenUser').del();
    await knex('Users').where('username', 'havenUser2').del();
    await knex('Groups').where('groupName', 'havenGroup').del();
  });

  test('create chat and get chats work well', async () => {

    await request(webapp).get(`/api/friends/${userId}/-1`).send()
      .expect(200)
      .then((response) => {
        // console.log(response.body);
        expect(response.body.length).toBe(1);
      });

    // create chat
    let chatsGroupId;
    await request(webapp).post('/api/chats').send({ userId: userId, curId: userId2 })
      .expect(200)
      .then((response) => {
        chatsGroupId = response.body;
      })

    // get chats 
    await request(webapp).get(`/api/chats/${userId}`).send()
      .expect(200)
      .then((response) => {
        // console.log(response.body);
        expect(response.body.length).toBe(1);
        expect(response.body[0].chatsGroupId).toBe(chatsGroupId);
        expect(response.body[0].userTalkTo.idUsers).toBe(userId2);
        expect(response.body[0].userTalkTo.username).toBe('havenUser2');
      })

    await request(webapp).get(`/api/chats/${userId2}`).send()
      .expect(200)
      .then((response) => {
        // console.log(response.body);
        expect(response.body.length).toBe(1);
        expect(response.body[0].userTalkTo.idUsers).toBe(userId);
      })

    // create chat again, get -1
    let chatsGroupId2;
    await request(webapp).post('/api/chats').send({ userId: userId, curId: userId2 })
      .expect(200)
      .then((response) => {
        chatsGroupId2 = response.body;
        expect(chatsGroupId2).toBe(-1);
      })

    await knex('ChatsGroup').where('idChatsGroup', chatsGroupId).del();
    await knex('ChatsGroup').where('idChatsGroup', chatsGroupId2).del();
    // await knex('Groups').del();
  });

  test('send a message and get messages work well', async () => {

    // create chat
    let chatsGroupId;
    await request(webapp).post('/api/chats').send({ userId: userId, curId: userId2 })
      .expect(200)
      .then((response) => {
        chatsGroupId = response.body;
      })

    // send two messages
    const body1 = {
      userId: userId,
      message: 'this is haven message',
      attachment: ''
    }

    await request(webapp).post(`/api/chat/${chatsGroupId}`).send(body1)
      .expect(200);

    const body2 = {
      userId: userId2,
      message: 'this is haven message2',
      attachment: ''
    }

    await request(webapp).post(`/api/chat/${chatsGroupId}`).send(body2)
      .expect(200);

    // get old to new messages
    await request(webapp).get(`/api/chat/${chatsGroupId}`).send()
      .expect(200)
      .then((response) => {
        // console.log(response.body)
        expect(response.body.length).toBe(2);
        expect(response.body[0].idUser).toBe(userId);
        expect(response.body[0].idChatsGroup).toBe(chatsGroupId);
        expect(response.body[1].message).toBe('this is haven message2');
      })

    await knex('ChatsGroup').where('idChatsGroup', chatsGroupId).del();
  });
});
