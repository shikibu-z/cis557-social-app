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

describe('Database operation: addUserToGroup', () => {
  let testUser, testGroup, testRelation;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_user_group@gmail.com',
      username: 'testuser_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_user_group',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_user_group').del();
    await knex('Groups').where('groupName', 'testgroup_user_group').del();
  });

  test('addUserToGroup adds a relation', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation = {
      idUser: idUser,
      idGroup: idGroup,
      role: 'creator',
    }
    const idRelation = await dbLib.addUserToGroup(db, testRelation);
    const relation = await knex.select('*').from('User_Group').where('idUser_Group', '=', idRelation);
    expect(relation[0].idUser).toBe(idUser);
    expect(relation[0].idGroup).toBe(idGroup);
    await knex('User_Group').where({ 'idUser': idUser, 'idGroup': idGroup }).del();
  });

  test('addUserToGroup throws exception if relation maldefined', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation = {
      idUser: idUser,
      idGroup: idGroup,
    };
    try {
      await dbLib.addUserToGroup(db, testRelation);
      await knex('User_Group').where({ 'idUser': idUser, 'idGroup': idGroup }).del();
    } catch (err) {
      expect(err.message).toBe('Error executing the query');
    }
  });
});

describe('Database operation: getAllUsersFromGroup', () => {
  let testUser1, testUser2, testGroup, testRelation1, testRelation2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_group@gmail.com',
      username: 'testuser1_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_group@gmail.com',
      username: 'testuser2_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_user_group',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_group').del();
    await knex('Users').where('username', 'testuser2_user_group').del();
    await knex('Groups').where('groupName', 'testgroup_user_group').del();
  });
  test('getAllUsersFromGroup gets all relations', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation1 = {
      idUser: idUser1,
      idGroup: idGroup,
      role: 'creator',
    }
    testRelation2 = {
      idUser: idUser2,
      idGroup: idGroup,
      role: 'user',
    }
    await dbLib.addUserToGroup(db, testRelation1);
    await dbLib.addUserToGroup(db, testRelation2);
    const relation = await dbLib.getAllUsersFromGroup(db, idGroup);
    expect(relation[0].idUsers).toBe(idUser1);
    expect(relation[1].idUsers).toBe(idUser2);
    await knex('User_Group').where({ 'idUser': idUser1, 'idGroup': idGroup }).del();
    await knex('User_Group').where({ 'idUser': idUser2, 'idGroup': idGroup }).del();
  });
});

describe('Database operation: updateUserToGroup', () => {
  let testUser, testGroup, testRelation;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_user_group@gmail.com',
      username: 'testuser_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_user_group',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });

  afterEach(async () => {
    await knex('Users').where('username', 'testuser_user_group').del();
    await knex('Groups').where('groupName', 'testgroup_user_group').del();
  });

  test('UpdateUserToGroup updates admin role', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation = {
      idUser: idUser,
      idGroup: idGroup,
      role: 'admin',
    }
    const idRelation = await dbLib.addUserToGroup(db, testRelation);
    await dbLib.updateUserToGroup(db, idUser, idGroup, 'user');
    const relation = await knex.select('*').from('User_Group').where('idUser_Group', '=', idRelation);
    expect(relation[0].role).toBe('user');
    await knex('User_Group').where({ 'idUser': idUser, 'idGroup': idGroup }).del();
  });

  test('UpdateUserToGroup throws exception if idRelation does not exist', async () => {
    try {
      await dbLib.updateUserToGroup(db, -1, undefined);
    } catch (err) {
      expect(err.message).toBe('Error executing the query')
    }
  });
});

describe('Database operation: getAllAdminsFromGroup', () => {
  let testUser1, testUser2, testGroup, testRelation1, testRelation2;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_group@gmail.com',
      username: 'testuser1_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testUser2 = {
      email: 'testuser2_user_group@gmail.com',
      username: 'testuser2_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_user_group',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_group').del();
    await knex('Users').where('username', 'testuser2_user_group').del();
    await knex('Groups').where('groupName', 'testgroup_user_group').del();
  });
  test('getAllAdminsFromGroup gets all admins', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idUser2 = await dbLib.addUser(db, testUser2);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation1 = {
      idUser: idUser1,
      idGroup: idGroup,
      role: 'creator',
    }
    testRelation2 = {
      idUser: idUser2,
      idGroup: idGroup,
      role: 'user',
    }
    await dbLib.addUserToGroup(db, testRelation1);
    await dbLib.addUserToGroup(db, testRelation2);
    const relations = await dbLib.getAllAdminsFromGroup(db, idGroup);
    expect(relations.length).toBe(1);
    expect(relations[0].idUsers).toBe(idUser1);
    await knex('User_Group').where({ 'idUser': idUser1, 'idGroup': idGroup }).del();
    await knex('User_Group').where({ 'idUser': idUser2, 'idGroup': idGroup }).del();
  });
});

describe('Database operation: deleteUserFromGroup', () => {
  let testUser, testGroup, testRelation;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');

  beforeEach(() => {
    testUser = {
      email: 'testuser_user_group@gmail.com',
      username: 'testuser_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_user_group',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser_user_group').del();
    await knex('Groups').where('groupName', 'testgroup_user_group').del();
  });
  test('deleteUserFromGroup deletes relation', async () => {
    const idUser = await dbLib.addUser(db, testUser);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation = {
      idUser: idUser,
      idGroup: idGroup,
      role: 'admin',
    }
    const idRelation = await dbLib.addUserToGroup(db, testRelation);
    await dbLib.deleteUserFromGroup(db, idUser, idGroup);
    const relation = await knex.select('*').from('User_Group').where('idUser_Group', '=', idRelation);
    expect(relation.length).toBe(0);
    await knex('User_Group').where({ 'idUser': idUser, 'idGroup': idGroup }).del();
  });
});

describe('Database operation: get groups by id', () => {
  let testUser1, testGroup;
  const datetime = new Date().toISOString().slice(0, 23).replace('T', ' ');
  beforeEach(() => {
    testUser1 = {
      email: 'testuser1_user_group@gmail.com',
      username: 'testuser1_user_group',
      password_hash: 'asdzxc',
      registrationDate: datetime,
      gender: 'female',
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
    testGroup = {
      groupName: 'testgroup_user_group',
      private: true,
      groupInfo: 'This is a test group.',
      createDate: datetime,
      profilePhoto: 'https://drive.google.com/file/d/1Pn3G0_kM1ED9QfBfKcQXKNutfCkb3wFi/'
    };
  });
  afterEach(async () => {
    await knex('Users').where('username', 'testuser1_user_group').del();
    await knex('Groups').where('groupName', 'testgroup_user_group').del();
  });
  test('groups user is in', async () => {
    const idUser1 = await dbLib.addUser(db, testUser1);
    const idGroup = await dbLib.addGroup(db, testGroup);
    testRelation = {
      idUser: idUser1,
      idGroup: idGroup,
      role: 'creator',
    }
    await dbLib.addUserToGroup(db, testRelation);
    const relations = await dbLib.getGroupsById(db, idUser1);
    expect(relations.length).toBe(1);
    await knex('User_Group').where({ 'idUser': idUser1, 'idGroup': idGroup }).del();
  });
});