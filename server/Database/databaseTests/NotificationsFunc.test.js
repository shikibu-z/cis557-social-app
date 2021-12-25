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

describe('Database operation: addNotification', () => {
  let testUser1, testUser2, testGroup, testNotification;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_notification@gmail.com',
      username: 'testuser1_notification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_notification@gmail.com',
      username: 'testuser2_notification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_notification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_notification').del();
    await knex('Users').where('username', 'testuser2_notification').del();
    await knex('Groups').where('groupName', 'testgroup_notification').del();
  });

  test('addNotification adds a notification', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testNotification = {
      idUser: idUser1,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'inviteOthers',
      action: 'Your invitation for user ? to join ? has been declined.',
      idUser_Action: idUser2,
      idGroup_Action: idGroup
    }
    const idNotification = await dbLib.addNotification(db, testNotification);
    const notification = await knex('Notifications').where('idNotifications', idNotification);
    expect(notification[0].idNotifications).toBe(idNotification);
    await knex('Notifications').where('idNotifications', idNotification).del();
  });
  test('addNotification throws exception if notification maldefined', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testNotification = {
      idUser: idUser1,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: null,
      action: 'Your invitation for user ? to join ? has been declined.',
      idUser_Action: idUser2,
      idGroup_Action: idGroup
    };
    try {
      const idNotification = await dbLib.addNotification(db, testNotification);
      await knex('Notifications').where('idNotifications', idNotification).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllNotificationsOfUser', () => {
  let testUser1, testUser2, testGroup, testNotification1, testNotification2, testNotification3, testNotification4;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_notification@gmail.com',
      username: 'testuser1_notification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_notification@gmail.com',
      username: 'testuser2_notification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_notification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_notification').del();
    await knex('Users').where('username', 'testuser2_notification').del();
    await knex('Groups').where('groupName', 'testgroup_notification').del();
  });

  test('getAllNotificationsOfUser gets all notifications of user order by read status then timestamp', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testNotification1 = {
      idUser: idUser1,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'inviteOthers',
      action: 'Your invitation for user ? to join ? has been declined.',
      idUser_Action: idUser2,
      idGroup_Action: idGroup
    };
    testNotification2 = {
      idUser: idUser2,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'inviteOthers',
      action: 'Your invitation for user ? to join ? has been declined.',
      idUser_Action: idUser1,
      idGroup_Action: idGroup
    };
    testNotification3 = {
      idUser: idUser1,
      read_status: true,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      type: 'flag',
      action: 'The post with title "Some Random Post" that you flagged in group ? has been deleted.',
      idUser_Action: null,
      idGroup_Action: idGroup
    };
    testNotification4 = {
      idUser: idUser1,
      read_status: false,
      timestamp: new Date((new Date()).getTime() + 86400000).toISOString().slice(0, 23).replace('T', ' '),
      type: 'invite',
      action: 'User ? invited you to join group ?',
      idUser_Action: idUser2,
      idGroup_Action: idGroup
    };
    const idNotification1 = await dbLib.addNotification(db, testNotification1);
    const idNotification2 = await dbLib.addNotification(db, testNotification2);
    const idNotification3 = await dbLib.addNotification(db, testNotification3);
    const idNotification4 = await dbLib.addNotification(db, testNotification4);
    let notification = await dbLib.getAllNotificationsOfUser(db, idUser1);
    expect(notification.length).toBe(3);
    expect(notification[0].idNotifications).toBe(idNotification4);
    expect(notification[1].idNotifications).toBe(idNotification1);
    expect(notification[2].idNotifications).toBe(idNotification3);
    notification = await dbLib.getAllNotificationsOfUser(db, idUser2);
    expect(notification.length).toBe(1);
    expect(notification[0].idNotifications).toBe(idNotification2);
    await knex('Notifications').where('idNotifications', idNotification1).del();
    await knex('Notifications').where('idNotifications', idNotification2).del();
    await knex('Notifications').where('idNotifications', idNotification3).del();
    await knex('Notifications').where('idNotifications', idNotification4).del();
  });
});

describe('Database operation: updateNotification', () => {
  let testUser1, testUser2, testGroup, testNotification;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_notification@gmail.com',
      username: 'testuser1_notification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_notification@gmail.com',
      username: 'testuser2_notification',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_notification',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_notification').del();
    await knex('Users').where('username', 'testuser2_notification').del();
    await knex('Groups').where('groupName', 'testgroup_notification').del();
  });

  test('updateNotification updates the read status of a notification', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testNotification = {
      idUser: idUser1,
      read_status: false,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'inviteOthers',
      action: 'Your invitation for user ? to join ? has been declined.',
      idUser_Action: idUser2,
      idGroup_Action: idGroup
    }
    const idNotification = await dbLib.addNotification(db, testNotification);
    await dbLib.updateNotification(db, idNotification, true);
    const notification = await knex('Notifications').where('idNotifications', idNotification);
    expect(notification[0].read_status).toBe(1);
    await knex('Notifications').where('idNotifications', idNotification).del();
  });
});
