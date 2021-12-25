// Create express app
const express = require('express');

const path = require('path');

const webapp = express();

require('dotenv').config();

const cors = require('cors');

const fs = require('fs');

webapp.use(express.json());
webapp.use(
  express.urlencoded({
    extended: true,
  }),
);

webapp.use(express.static(path.join(__dirname, '../client/build')));
// enable cross-origin
webapp.use(cors());

// import the db operations
const encrypt = require('./encryptHelper');
const lib = require('./Database/dbOperationMySQL');
const { group } = require('console');

let db;
// Start server and connect to the DB
const port = process.env.PORT || 5000;
webapp.listen(port, async () => {
  db = await lib.connect();
  console.log(`Server running on port:${port}`);
});

// feature 1 - user registration
webapp.post('/api/registration', async (req, res) => {
  /* eslint-disable-next-line no-restricted-syntax */
  if (Object.values(req.body).some((prop) => prop === null)) {
    res.status(400).json({ error: 'Bad input parameter' });
    return;
  }

  const encPass = await encrypt.hashPassword(req.body.password);
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    registrationDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
    gender: req.body.gender,
    profilePhoto: '',
    password_hash: encPass,
  };
  try {
    const uid = await lib.addUser(db, newUser);
    const userInfo = await lib.getUserById(db, uid);
    res.status(201).json({ id: uid });
  } catch (error) {
    res.status(409).json({ error: 'The item already exist' });
  }
});

webapp.put('/api/resetPassword', async (req, res) => {
  // Verify input params
  if (req.body === undefined || req.body.username === undefined || req.body.email === undefined || req.body.password === undefined) {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  try {
    const userInfo = await lib.getUser(db, req.body.username);
    if (req.body.email !== userInfo.email) {
      res.status(401).json({ error: 'email not match' });
      return;
    }
    const newPassword = await encrypt.hashPassword(req.body.password);
    const result = await lib.updateAuth(db, userInfo.idUsers, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// feature 2 - user login
webapp.post('/api/login', async (req, res) => {
  /* eslint-disable-next-line no-restricted-syntax */
  if (Object.values(req.body).some((prop) => prop === null)) {
    res.status(401).json({ error: 'Invalid username or password' });
  }
  try {
    const userRecord = await lib.getUser(db, req.body.username);
    const authRecord = await lib.getAuth(db, userRecord.idUsers);
    const nameValid = req.body.username === userRecord.username;
    const passValid = await encrypt.checkPassword(req.body.password, authRecord.password_hash);
    if (nameValid && passValid) {
      res.status(200).json({ id: userRecord.idUsers });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

/**
 * Endpoint for feature #3.1 - get profile by userId
 */
webapp.get('/api/profile/:userId', async (req, res) => {
  try {
    // Missing id
    if (req.params.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Get needed information
    const id = req.params.userId;
    const userInfo = await lib.getUserById(db, id);
    const topics = await lib.getAllTopicsOfUser(db, id);
    const profile = {
      userId: id,
      username: userInfo.username,
      gender: userInfo.gender,
      email: userInfo.email,
      photo: userInfo.profilePhoto,
      registrationDate: userInfo.registrationDate,
      interests: topics.map(t => t.topic)
    }
    res.status(200).json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #3.2 - edit profile by userId
 */
webapp.put('/api/profile/:userId/edit', async (req, res) => {
  try {
    // Missing id
    if (req.params.userId === undefined || req.body === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }

    // Get origin user profile
    const id = req.params.userId;
    // const originInfo = await lib.getUserById(db, id);
    // update profile photo if passed
    if (req.body.photo !== '') {
      const updateProfile = {
        photo: req.body.photo
      }
      await lib.updateUser(db, id, updateProfile);
    }

    // Update tags if have
    if (req.body.tag.length > 0) {
      const tags = req.body.tag;
      const allTopics = (await lib.getTopics(db)).map((t) => t.topic);
      for (let i = 0; i < tags.length; i++) {
        if (allTopics.indexOf(tags[i]) === -1) { await lib.addTopic(db, tags[i]); }
        await lib.addTopicToUser(db, id, tags[i]);
      }
    }

    // Update password if have
    if (req.body.oldPassword !== '' && req.body.newPassword !== '') {
      // const encOldPass = await encrypt.hashPassword(req.body.oldPassword);
      const encNewPass = await encrypt.hashPassword(req.body.newPassword);
      const oldPass = await lib.getAuth(db, id);
      // Old pass not match, return
      const correct = await encrypt.checkPassword(req.body.oldPassword, oldPass.password_hash);
      if (!correct) {
        res.status(401).json({ error: 'invalid old password' });
        return;
      }
      await lib.updateAuth(db, id, encNewPass);
    }
    res.status(200).json({});
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #3.3 - delete account by id
 */
webapp.delete('/api/deleteAccount', async (req, res) => {
  try {
    // Missing id
    if (req.body.id === undefined) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    // Get delete account
    const result = await lib.deleteUser(db, req.body.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #4 and #5 - group creation
 */
webapp.post('/api/groupCreation', async (req, res) => {
  try {
    // Missing input params
    if (req.body === undefined) {
      res.status(401).json({ error: 'Missing input params' });
      return;
    }

    const id = req.body.userid;

    const groupInpInfo = {
      groupName: req.body.groupName,
      private: req.body.private,
      groupInfo: req.body.groupIntro,
      createDate: new Date().toISOString().slice(0, 23).replace('T', ' '),
      profilePhoto: req.body.profilePhoto
    }
    // Call create function and add creator to group as admin
    const idGroup = await lib.addGroup(db, groupInpInfo);
    //add user to group and make admin
    await lib.addUserToGroup(db, {
      idUser: id,
      idGroup: idGroup,
      role: 'creator',
    });
    // console.log('added user');

    // Add tags for group
    if (req.body.groupTags !== undefined) {
      const topics = req.body.groupTags;
      const allTopics = (await lib.getTopics(db)).map((t) => t.topic);
      for (let i = 0; i < topics.length; i++) {
        const index = allTopics.indexOf(topics[i]);
        if (index === -1) { await lib.addTopic(db, topics[i]); };
        await lib.addTopicToGroup(db, idGroup, topics[i]);
      }
    }
    res.status(201).json(idGroup);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #6.1 - add administrator
*/
webapp.post('/api/addAdmin', async (req, res) => {
  try {
    // Validate input param
    if (req.body.groupId === undefined || req.body.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const usersInGroup = await lib.getAllUsersFromGroup(db, req.body.groupId);
    let result = null;
    // Find corresponding idUser_Group
    for (let i = 0; i < usersInGroup.length; i++) {
      if (usersInGroup[i].idUsers === req.body.userId) {
        result = await lib.updateUserToGroup(db, usersInGroup[i].idUsers, req.body.groupId, 'admin');
        break;
      }
    }
    // TODO: need to send notification to user
    const group = await lib.getGroup(db, req.body.groupId);
    const notification = {
      idUser: req.body.userId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'addAdmin',
      action: `You are promoted as administrator of ${group.groupName}`,
      idUser_Action: req.body.userId,
      idGroup_Action: req.body.groupId,
    }
    const notiId = await lib.addNotification(db, notification);
    res.status(200).json(notiId);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #6.2 - remove administrator
*/
webapp.put('/api/removeAdmin', async (req, res) => {
  try {
    // Validate input param
    if (req.body.groupId === undefined || req.body.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const usersInGroup = await lib.getAllUsersFromGroup(db, req.body.groupId);
    let result = null;
    // Find corresponding idUser_Group
    for (let i = 0; i < usersInGroup.length; i++) {
      if (usersInGroup[i].idUsers === req.body.userId) {
        result = await lib.updateUserToGroup(db, usersInGroup[i].idUsers, req.body.groupId, 'user');
        break;
      }
    }
    const group = await lib.getGroup(db, req.body.groupId);
    const notification = {
      idUser: req.body.userId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'removeAdmin',
      action: `You are removed from administrators list of ${group.groupName}`,
      idUser_Action: req.body.userId,
      idGroup_Action: req.body.groupId,
    }
    await lib.addNotification(db, notification);
    res.status(201).json({ message: 'success' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #6.3 - get all administrators
 */
webapp.get('/api/getAdmins/:groupId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const admins = await lib.getAllAdminsFromGroup(db, req.params.groupId);
    res.status(200).json(admins);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #7.1 - request to join a group
 */
webapp.post('/api/reqToJoinGroup/:groupId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined || req.body.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const user = await lib.getUserById(db, req.body.userId);
    // Add notification to admin in group
    const adminNotiId = await lib.addAdminNotification(db, {
      idGroup: req.params.groupId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: `${user.username} request to join the group`,
      idUser_Action: req.body.userId,
      idPost_Action: req.body.postId ? req.body.postId : null
    });
    // Add pending request to user's notification
    const group = await lib.getGroup(db, req.params.groupId);
    const notiId = await lib.addNotification(db, {
      idUser: req.body.userId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'join',
      action: `You requested to join group ${group.groupName}.`,
      idUser_Action: req.body.userId,
      idGroup_Action: req.params.groupId
    });
    res.status(200).json({ adminNotiid: adminNotiId, notiId: notiId });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #7.2 - solve request to join a group (admin)
 */
webapp.put('/api/solveJoinRequest/:adminNotiId', async (req, res) => {
  try {
    // Check input params
    if (req.params.adminNotiId === undefined || req.body.userId === undefined || req.body.groupId === undefined || req.body.approve === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Update notification as 'read'
    await lib.updateAdminNotification(db, req.params.adminNotiId, 1);
    const user = await lib.getUserById(db, req.body.userId);
    const group = await lib.getGroup(db, req.body.groupId);
    // If approved, send notification to user, add user to group
    if (req.body.approve === 1) {
      // Add a notification for user
      const notiId = await lib.addNotification(db, {
        idUser: req.body.userId,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'join',
        action: `Joined group ${group.groupName}`,
        idUser_Action: req.body.userId,
        idGroup_Action: req.body.groupId
      });
      await lib.addUserToGroup(db, {
        idUser: req.body.userId,
        idGroup: req.body.groupId,
        role: 'user',
      })
    } else {
      // Add a notification for user
      await lib.addNotification(db, {
        idUser: req.body.userId,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'join',
        action: `Request to join ${group.groupName} is rejected`,
        idUser_Action: req.body.userId,
        idGroup_Action: req.body.groupId
      });
    }
    res.status(200).json({ message: 'request solved' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #8 - Invite a user into a group
 */
webapp.post('/api/invite', async (req, res) => {
  try {
    // Check input params
    if (req.body.senderId === undefined || req.body.receiverId === undefined || req.body.groupId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const group = await lib.getGroup(db, req.body.groupId);
    const sender = await lib.getUserById(db, req.body.senderId);
    const receiver = await lib.getUserById(db, req.body.receiverId);
    // Add invitation to sender's notification
    const senderNotiId = await lib.addNotification(db, {
      idUser: req.body.senderId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'inviteOthers',
      action: `You have invited ${receiver.username} to join group ${group.groupName}`,
      idUser_Action: req.body.receiverId,
      idGroup_Action: req.body.groupId
    });
    // Add invitation to receiver's notification
    const recvNotiId = await lib.addNotification(db, {
      idUser: req.body.receiverId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'invite',
      action: `You are invited to join group ${group.groupName} by ${sender.username}`,
      idUser_Action: req.body.senderId,
      idGroup_Action: req.body.groupId
    });
    res.status(200).json({ senderNotiId: senderNotiId, recvNotiId: recvNotiId, message: 'invited' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #8 - solve invitation from another user
 */
webapp.put('/api/solveInvitation', async (req, res) => {
  try {
    // Check input params
    if (req.body.notiId === undefined || req.body.userId === undefined || req.body.groupId === undefined || req.body.approve === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Update notification as 'read'
    await lib.updateNotification(db, req.body.notiId, 1);
    // If approved, send notification to user, add user to group
    if (req.body.approve) {
      // Add notification to admin in group
      const user = await lib.getUserById(db, req.body.userId);
      const adminNotiId = await lib.addAdminNotification(db, {
        idGroup: req.body.groupId,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'join',
        action: `${user.username} requested to join group.`,
        idUser_Action: req.body.userId,
        idPost_Action: null
      });
    } else {
      // Add a notification for sender
      const user = await lib.getUserById(db, req.body.userId);
      const group = await lib.getGroup(db, req.body.groupId);
      await lib.addNotification(db, {
        idUser: req.body.userId,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'join',
        action: `Your invitation to join group ${group.groupName} was rejected by ${user.username}.`,
        idGroup_Action: req.body.groupId,
        idUser_Action: req.body.userId,
      });
    }
    res.status(200).json({ message: 'invitaion solved' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for feature #9 - Leave a group
 * @return:
 */
webapp.delete('/api/leaveGroup/:groupId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined || req.body.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Send notification to admin in group
    const user = await lib.getUserById(db, req.body.userId);
    const notiId = await lib.addAdminNotification(db, {
      idGroup: req.params.groupId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'leave',
      action: `${user.username} left the group`,
      idUser_Action: req.body.userId,
      idPost_Action: null
    });
    // Delete user from group
    await lib.deleteUserFromGroup(db, req.body.userId, req.params.groupId)
    res.status(200).json({ message: 'left' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for - get all public groups
 * @return: an array of public groups
 */
webapp.get('/api/getGroups', async (req, res) => {
  try {
    const groups = await lib.getAllGroups(db);
    const publicGroups = groups.filter((g) => g.private === 0)
    res.status(200).json(publicGroups);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for - get all notifications for a user
 * @return: an array of notifications
 */
webapp.get('/api/notification/:userId', async (req, res) => {
  try {
    // Check input params
    if (req.params.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const notifications = await lib.getAllNotificationsOfUser(db, req.params.userId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for - update notification
 */
webapp.put('/api/notification/:userId', async (req, res) => {
  try {
    // Check input params
    if (req.params.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Check input body params
    if (req.body.notiId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Update notification as 'read'
    await lib.updateNotification(db, req.body.notiId, 1);
    res.status(200).json({ message: 'changed notification read status' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for - get all notifications for a group
 * @return: an array of notifications
 */
webapp.get('/api/groupNotification/:groupId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const notifications = await lib.getAllAdminNotificationsOfGroup(db, req.params.groupId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for - update group admin notification
 */
webapp.put('/api/groupNotification/:groupId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Check input body params
    if (req.body.adminNotificationId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    // Update adminnotification as 'read'
    await lib.updateAdminNotification(db, req.body.adminNotificationId, 1);
    res.status(200).json({ message: 'changed admin notification read status' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * Endpoint for - get group analytics
 */
webapp.get('/api/analytics/:groupId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    let result = await lib.getAllUsersFromGroup(db, req.params.groupId);
    const memberCount = result.length;
    const group = await lib.getGroup(db, req.params.groupId);
    const deleted = group.deletedPosts;
    const posts = await lib.getAllPostsOfGroup(db, req.params.groupId);
    const postCount = posts.length;
    const hposts = await lib.getAllHiddenPostOfGroup(db, req.params.groupId);
    const hidden = hposts.length;
    const fposts = await lib.getAllFlaggedPostOfGroup(db, req.params.groupId);
    const flagged = fposts.length;
    res.status(200).json({ memberCount: memberCount, deleted: deleted, postCount: postCount, hidden: hidden, flagged: flagged });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

webapp.post('/api/mention/:groupId/:userId', async (req, res) => {
  try {
    // Check input params
    if (req.params.groupId === undefined || req.params.userId === undefined) {
      res.status(400).json({ error: 'Bad request' });
      return;
    }
    const group = await lib.getGroup(db, req.params.groupId);
    const user = await lib.getUserById(db, req.params.userId);
    const result = await lib.addNotification(db, {
      idUser: req.body.userId,
      read_status: 0,
      timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
      type: 'mention',
      action: `You are mentioned in ${group.groupName} by ${user.username}`,
      idUser_Action: req.params.userId,
      idGroup_Action: req.params.groupId,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 10 - get all topics
// return array of topic objects
webapp.get('/api/topics', async (req, res) => {
  try {
    const results = await lib.getTopics(db);
    res.status(200).json(results);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

webapp.get('/api/groupsbyId/:userid', async (req, res) => {
  try {
    const results = await lib.getGroupsById(db, req.params.userid);
    res.status(200).json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

webapp.get('/api/getGroupMembers/:groupid', async (req, res) => {
  try {
    const results = await lib.getAllUsersFromGroup(db, req.params.groupid);
    res.status(200).json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

// get group with group id - for notifications
// return group object
webapp.get('/api/group/:groupId', async (req, res) => {
  try {
    const result = await lib.getGroup(db, req.params.groupId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// feature 10, 14 - get groups with cur user id & filters
// return array of {# of members, is current user joined, group object}
webapp.get('/api/groups/:userId', async (req, res) => {

  try {
    // get all filters
    const queries = req.query;
    const filters = [];
    for (const query in queries) {
      if (queries[query] === String(true)) {
        filters.push(query);
      }
    }

    // get groups associated with filters
    const groupIds = await lib.getAllGroupsOfSelectedTopics(db, filters);
    let groups = [];
    for (const groupId of groupIds) {
      const group = await lib.getGroup(db, groupId.idGroup);
      groups.push(group);
    }
    // no query case
    if (filters.length === 0) {
      groups = await lib.getAllGroups(db);
    }

    const retArr = [];

    for (const g of groups) {
      const members = await lib.getAllUsersFromGroup(db, g.idGroups);
      const memberIds = members.map(a => a.idUsers);
      if (Number(g.private) === 0) {
        retArr.push({
          numOfMembers: members.length,
          isJoined: memberIds.includes(Number(req.params.userId)),
          group: g,
        })
      }
    };

    res.status(200).json(retArr);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

webapp.get('/api/friends/:userid/:groupid', async (req, res) => {
  try {
    const results = await lib.getFriends(db, req.params.userid, req.params.groupid);
    const data = results.filter((f) => f.IdUser != req.params.userid);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

// specific group page - get the group info
// both specific group & specific post page use this to check if current user is admin
// return {# of members, is current user joined, is current user administrator, group object}
webapp.get('/api/group/:groupId/info/:userId', async (req, res) => {
  try {
    const groupObj = await lib.getGroup(db, req.params.groupId);
    const members = await lib.getAllUsersFromGroup(db, groupObj.idGroups);
    const admins = await lib.getAllAdminsFromGroup(db, groupObj.idGroups);
    const memberIds = members.map(a => a.idUsers);
    const adminIds = admins.map(a => a.idUsers);

    res.status(200).json({
      numOfMembers: members.length,
      isJoined: memberIds.includes(Number(req.params.userId)),
      isAdmin: adminIds.includes(Number(req.params.userId)),
      group: groupObj,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 11 - post a new post to cur group
// return the new post id
webapp.post('/api/group/:groupId', async (req, res) => {
  // check input first
  if (req.body.userId === undefined
    || req.body.flagged === undefined
    || req.body.title === undefined) {
    res.status(404).json({ error: 'Missing parts of post' });
    return;
  }

  // // convert attachment into url
  // let attachmentUrl = 'placeholder';

  // // store attachment in temporary file and convert it to attachment src url;
  // if (req.body.attachment.length > 0) {
  //   const tempPath = `../assets/postFiles/${req.body.userId + new Date().toLocaleString()}`;
  //   fs.writeFile(tempPath, req.body.attachment, 'binary');
  //   attachmentUrl = await upload(tempPath);
  // }


  // construct the new post
  const newPost = {
    idUser: req.body.userId,
    idGroup: req.params.groupId,
    timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
    flagged: req.body.flagged,
    title: req.body.title,
    content: req.body.content,
    attachment: req.body.attachment
  };

  try {
    const result = await lib.addPost(db, newPost);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 15 - display all post in a group (considering flag/hide effect)
// no need to consider author/admin for this component
// return array of post object
webapp.get('/api/group/:groupId/posts/:userId', async (req, res) => {
  try {
    const posts = await lib.getAllPostsOfGroup(db, req.params.groupId);
    const hides = await lib.getAllHiddenPostsOfUser(db, req.params.userId);
    const hideIds = hides.map(a => a.idPosts);
    const postsCanShow = posts.filter(a => !hideIds.includes(a.idPosts));
    const pageNum = req.query.page;
    const pageSize = 4;
    const pageData = postsCanShow.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    res.status(200).json(pageData);
    // postEventEmitter.once('postChange', (from, post) => {
    //   const posts = await lib.getAllPostsOfGroup(db, req.params.groupId);
    //   const hides = await lib.getAllHiddenPostsOfUser(db, req.params.userId);
    //   const hideIds = hides.map(a => a.idPosts);
    //   const postsCanShow = posts.filter(a => !hideIds.includes(a.idPosts));
    //   const pageNum = req.query.page;
    //   const pageSize = 4;
    //   const pageData = postsCanShow.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    //   res.status(200).json(pageData);
    // });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// get post at specific post page
// return post object
webapp.get('/api/group/:groupId/post/:postId/:userId', async (req, res) => {
  try {
    const post = await lib.getPost(db, req.params.postId);
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 12, 18 - flag or hide a post, flag and post are in body
webapp.put('/api/group/:groupId/post/:postId', async (req, res) => {
  try {
    // if flag, update post and send notification
    if (req.body.flag === true) {
      await lib.updatePost(db, req.params.postId, 1);

      const flagger = await lib.getUserById(db, req.body.userId);
      const flaggedPost = await lib.getPost(db, req.params.postId);

      // send notification to admins in the group
      const newAdminNotification = {
        idGroup: req.params.groupId,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'flag',
        action: `${flagger.username} flagged "${flaggedPost.title}" for deletion.`,
        idUser_Action: req.body.userId,
        idPost_Action: req.params.postId,
      }
      const result = await lib.addAdminNotification(db, newAdminNotification);
      res.status(200).json(result);
    }

    // if hide, add into user-hide
    if (req.body.hide === true) {
      const hidePostId = await lib.addHidePost(db, req.body.userId, req.params.postId);
      res.status(200).json(hidePostId);
    }
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 12 - admin solve the flag request
webapp.post('/api/solveFlagRequest/:adminNotificationId', async (req, res) => {

  // check input first
  if (req.body.userIdWhoFlag === undefined
    || req.body.postId === undefined
    || req.body.approve === undefined
    || req.body.adminId === undefined) {
    res.status(404).json({ error: 'Missing parts of response' });
    return;
  }

  try {
    const admin = await lib.getUserById(db, req.body.adminId);
    const flaggedPost = await lib.getPost(db, req.body.postId);

    // if approve, delete and notify author & flagger
    if (req.body.approve === true) {
      const postToDelete = await lib.getPost(db, req.body.postId);
      await lib.deletePost(db, req.body.postId);
      await lib.addNotification(db, {
        idUser: postToDelete.idUser,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'flag',
        action: `${admin.username} deleted post "${flaggedPost.title}".`,
        idUser_Action: req.body.adminId,
        idGroup_Action: postToDelete.idGroup,
      });

      await lib.addNotification(db, {
        idUser: req.body.userIdWhoFlag,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'flag',
        action: `${admin.username} deleted post "${flaggedPost.title}".`,
        idUser_Action: req.body.adminId,
        idGroup_Action: postToDelete.idGroup,
      });

    } else {
      // only notify the flagger user
      const postToDelete = await lib.getPost(db, req.body.postId);
      await lib.addNotification(db, {
        idUser: req.body.userIdWhoFlag,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'flag',
        action: `${admin.username} did not delete post "${flaggedPost.title}".`,
        idUser_Action: req.body.adminId,
        idGroup_Action: postToDelete.idGroup,
      });
    }

    // update admin notification to read
    const result = await lib.updateAdminNotification(db, req.params.adminNotificationId, 1);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 13 - delete a post and notify author if deleted by admin
webapp.delete('/api/group/:groupId/post/:postId/:userId', async (req, res) => {
  try {
    const postToDelete = await lib.getPost(db, req.params.postId);
    const result = await lib.deletePost(db, req.params.postId);
    const deleter = await lib.getUserById(db, req.params.userId);

    // check if deleted by admin, if so, notify the author
    if (req.params.userId !== postToDelete.idUser) {
      await lib.addNotification(db, {
        idUser: postToDelete.idUser,
        read_status: 0,
        timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
        type: 'delete',
        action: `${deleter.username} deleted post "${postToDelete.title}".`,
        idUser_Action: req.params.userId,
        idGroup_Action: postToDelete.idGroup,
      });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// specific post page - get all comments of a post
// return array of comment object - author info is inside comment object
webapp.get('/api/group/:groupId/post/:postId/comments/:userId', async (req, res) => {
  try {
    const result = await lib.getAllCommentsOfPost(db, req.params.postId);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 16 - comment on a post
webapp.post('/api/group/:groupId/post/:postId', async (req, res) => {
  // check input first
  if (req.body.userId === undefined
    || req.body.content === undefined) {
    res.status(404).json({ error: 'Missing parts of comment' });
  }

  const newComment = {
    idUser: req.body.userId,
    idPost: req.params.postId,
    timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
    content: req.body.content,
  };

  try {
    const result = await lib.addComment(db, newComment);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 19 - delete a comment
webapp.delete('/api/group/:groupId/post/:postId/comment/:commentId', async (req, res) => {
  try {
    const result = await lib.deleteComment(db, req.params.commentId);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});


// feature20 - create chats between two user
// if they has been in a chats group then just return
webapp.post('/api/chats', async (req, res) => {

  const userId = req.body.userId;
  const curId = req.body.curId;

  try {
    // check if there exist a chatsGroup
    const chatsGroupRows1 = await lib.getAllChatsGroupForUser(db, userId);
    const chatsGroupRows2 = await lib.getAllChatsGroupForUser(db, curId);
    const chatsGroupIds1 = chatsGroupRows1.map(a => a.idChatsGroup);
    const chatsGroupIds2 = chatsGroupRows2.map(a => a.idChatsGroup);

    const intersection = chatsGroupIds1.filter(value => chatsGroupIds2.includes(value));
    if (intersection.length > 0) {
      res.status(200).json(-1);
      return;
    }

    // else need to create chatsgroup and add users
    const chatsGroupId = await lib.addChatsGroup(db);
    await lib.addUserToChatsGroup(db, chatsGroupId, userId);
    await lib.addUserToChatsGroup(db, chatsGroupId, curId);
    res.status(200).json(chatsGroupId);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});


// feature 20 - get all chats of current user
// return {chatsGroupId, user object you are talk to}
// cannot find a deleted account 
webapp.get('/api/chats/:userId', async (req, res) => {
  try {
    const chatsGroupRows = await lib.getAllChatsGroupForUser(db, req.params.userId);
    const result = [];
    const curGroups = await lib.getGroupsById(db, req.params.userId);
    const curGroupIds = curGroups.map(c => c.idGroups);

    for (const chatsGroupRow of chatsGroupRows) {
      const userRows = await lib.getAllUsersOfChatsGroup(db, chatsGroupRow.idChatsGroup);

      // jump deleted account scenario
      // console.log(userRows);
      if (userRows.length !== 2) continue;

      // get another one
      let otherId;
      for (const userRow of userRows) {
        if (userRow.idUser !== Number(req.params.userId)) otherId = userRow.idUser;
      }

      // check if they have shared groups
      const otherGroups = await lib.getGroupsById(db, otherId);
      const otherGroupIds = otherGroups.map(o => o.idGroups);
      const intersection = curGroupIds.filter(value => otherGroupIds.includes(value));
      if (intersection.length === 0) continue;

      const other = await lib.getUserById(db, otherId);
      result.push({
        chatsGroupId: chatsGroupRow.idChatsGroup,
        userTalkTo: other
      })
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 20 - get all messages with chatsGroupId
// return array of chat messages
webapp.get('/api/chat/:chatsGroupId', async (req, res) => {
  try {
    const messages = await lib.getAllChatsMessageOfChatsGroup(db, req.params.chatsGroupId);
    res.status(200).json(messages);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 20 - send a message into the chatsGroup
webapp.post('/api/chat/:chatsGroupId', async (req, res) => {
  // check input first
  if (req.body.userId === undefined
    || (req.body.message === undefined && req.body.attachment === undefined)) {
    res.status(404).json({ error: 'Missing parts of comment' });
  }

  const newMessage = {
    idUser: req.body.userId,
    idChatsGroup: req.params.chatsGroupId,
    timestamp: new Date().toISOString().slice(0, 23).replace('T', ' '),
    message: req.body.message,
    attachment: req.body.attachment
  };

  try {
    const result = await lib.addChatsMessage(db, newMessage);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// feature 21 - return sorted group list by post/member/recent
webapp.get('/api/getSortedGroups/:method', async (req, res) => {
  try {
    const queries = req.query;
    const filters = [];
    for (const query in queries) {
      if (queries[query] === String(true)) {
        filters.push(query);
      }
    }
    // filter topics
    let groups;
    let queryId = [];
    if (filters.length === 0) {
      groups = await lib.getAllGroups(db);
    } else {
      groups = await lib.getAllGroupsOfSelectedTopics(db, filters);
    }
    for (const group of groups) {
      if (group.idGroup !== undefined) {
        queryId.push(group.idGroup);
      } else {
        queryId.push(group.idGroups);
      }
    }
    // get sorted group
    let groupsIdBySort;
    switch (req.params.method) {
      case 'post':
        groupsIdBySort = await lib.sortGroupsByNumberOfPosts(db, queryId);
        break;
      case 'member':
        groupsIdBySort = await lib.sortGroupsByNumberOfUsers(db, queryId);
        break;
      case 'recent':
        groupsIdBySort = await lib.sortGroupsByLatestPosts(db, queryId);
        break;
      default:
        // this will and should not happen in any case
        break;
    }
    // generate return value
    const result = [];
    for (const sortEntry of groupsIdBySort) {
      const group = await lib.getGroup(db, sortEntry.idGroups);
      const members = await lib.getAllUsersFromGroup(db, sortEntry.idGroups);
      const memberIds = members.map(a => a.idUsers);
      if (Number(group.private) === 0) {
        result.push({
          numOfMembers: members.length,
          isJoined: memberIds.includes(Number(req.params.userId)),
          group,
        })
      }
    };
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// feature 24 - get suggested groups for a user
webapp.get('/api/getSuggestedGroups/:userId', async (req, res) => {
  try {
    const groupsId = await lib.suggestedGroupsForUser(db, req.params.userId);
    const result = [];
    for (const entry of groupsId) {
      const group = await lib.getGroup(db, entry.idGroups);
      const members = await lib.getAllUsersFromGroup(db, entry.idGroups);
      const memberIds = members.map(a => a.idUsers);
      if (Number(group.private) === 0) {
        result.push({
          numOfMembers: members.length,
          isJoined: memberIds.includes(Number(req.params.userId)),
          group,
        })
      }
    };
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


// Root endpoint
// TODO: Will need to alter this for deployment
webapp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Default response for any other request
webapp.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
module.exports = webapp;
