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

describe('Database operation: addAdminNotification', () => {
  let testUser1, testGroup, testAdminNotification;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_adminnotification@gmail.com',
      username: 'testuser1_adminnotification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_adminnotification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_adminnotification').del();
    await knex('Groups').where('groupName', 'testgroup_adminnotification').del();
  });

  test('addAdminNotification adds an adminNotification', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testAdminNotification = {
      idGroup: idGroup,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: 'User ? joined the group',
      idUser_Action: idUser1,
      idPost_Action: null
    }
    const idAdminNotification = await dbLib.addAdminNotification(db, testAdminNotification);
    const adminnotification = await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification);
    expect(adminnotification[0].idAdminNotifications).toBe(idAdminNotification);
    await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification).del();
  });
  test('addAdminNotification throws exception if adminNotification maldefined', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testAdminNotification = {
      idGroup: idGroup,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: null,
      action: 'User ? joined the group',
      idUser_Action: idUser1,
      idPost_Action: null
    }
    try {
      const idAdminNotification = await dbLib.addAdminNotification(db, testAdminNotification);
      await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllAdminNotificationsOfGroup', () => {
  let testUser1, testGroup1, testGroup2, testAdminNotification1, testAdminNotification2, testAdminNotification3, testAdminNotification4;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_adminnotification@gmail.com',
      username: 'testuser1_adminnotification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup1 = {
      groupName: 'testgroup1_adminnotification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup2 = {
      groupName: 'testgroup2_adminnotification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_adminnotification').del();
    await knex('Groups').where('groupName', 'testgroup1_adminnotification').del();
    await knex('Groups').where('groupName',  'testgroup2_adminnotification').del();
  });

  test('getAllAdminNotificationsOfGroup gets all adminNotifications order by read status and timestamp', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup1 = await dbLib.addGroup(db, testGroup1);
    const idGroup2 = await dbLib.addGroup(db, testGroup2);
    testAdminNotification1 = {
      idGroup: idGroup1,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: 'User ? joined the group',
      idUser_Action: idUser1,
      idPost_Action: null
    };
    testAdminNotification2 = {
      idGroup: idGroup2,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: 'User ? joined the group',
      idUser_Action: idUser1,
      idPost_Action: null
    };
    testAdminNotification3 = {
      idGroup: idGroup1,
      read_status: false,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: 'User ? joined the group',
      idUser_Action: idUser1,
      idPost_Action: null
    };
    testAdminNotification4 = {
      idGroup: idGroup1,
      read_status: true,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: 'User ? joined the group',
      idUser_Action: idUser1,
      idPost_Action: null
    };
    const idAdminNotification1 = await dbLib.addAdminNotification(db, testAdminNotification1);
    const idAdminNotification2 = await dbLib.addAdminNotification(db, testAdminNotification2);
    const idAdminNotification3 = await dbLib.addAdminNotification(db, testAdminNotification3);
    const idAdminNotification4 = await dbLib.addAdminNotification(db, testAdminNotification4);
    let adminnotification = await dbLib.getAllAdminNotificationsOfGroup(db, idGroup1);
    expect(adminnotification.length).toBe(3);
    expect(adminnotification[0].idAdminNotifications).toBe(idAdminNotification3);
    expect(adminnotification[1].idAdminNotifications).toBe(idAdminNotification1);
    expect(adminnotification[2].idAdminNotifications).toBe(idAdminNotification4);
    adminnotification = await dbLib.getAllAdminNotificationsOfGroup(db, idGroup2);
    expect(adminnotification[0].idAdminNotifications).toBe(idAdminNotification2);
    await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification1).del();
    await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification2).del();
    await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification3).del();
    await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification4).del();
  });
});

describe('Database operation: updateAdminNotification', () => {
  let testUser1, testGroup, testPost, testAdminNotification;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_adminnotification@gmail.com',
      username: 'testuser1_adminnotification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_adminnotification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_adminnotification').del();
    await knex('Groups').where('groupName', 'testgroup_adminnotification').del();
  });

  test('updateAdminNotification updates an adminNotification read status', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testPost = {
      idUser: idUser1,
      idGroup: idGroup,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      flagged: false,
      title: 'This is a test post',
      content: '500 character limit post',
      attachment: null
    };
    const idPost = await dbLib.addPost(db, testPost);
    testAdminNotification = {
      idGroup: idGroup,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'flag',
      action: 'User ? flagged the post ?',
      idUser_Action: idUser1,
      idPost_Action: idPost,
    }
    const idAdminNotification = await dbLib.addAdminNotification(db, testAdminNotification);
    await dbLib.updateAdminNotification(db, idAdminNotification, true)
    const adminnotification = await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification);
    expect(adminnotification[0].read_status).toBe(1);
    await knex('Posts').where('idPosts', idPost).del();
    await knex('AdminNotifications').where('idAdminNotifications', idAdminNotification).del();
  });
});