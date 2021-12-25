const mysql = require('mysql2/promise');
require('dotenv').config();
const { addUser, getUser, getUserById, getAllUsers, updateUser, deleteUser, getFriends } = require('./tableFunc/UsersFunc');
const { getAuth, updateAuth } = require('./tableFunc/AuthenticationFunc');
const { addGroup, getGroup, getAllGroups, updateGroup } = require('./tableFunc/GroupsFunc');
const { addUserToGroup, getAllUsersFromGroup, updateUserToGroup,
  getAllAdminsFromGroup, deleteUserFromGroup, getGroupsById } = require('./tableFunc/User_GroupFunc');
const { addTopic, getTopics } = require('./tableFunc/TopicsFunc');
const { addTopicToUser, deleteTopicFromUser, getAllTopicsOfUser } = require('./tableFunc/User_TopicFunc');
const { addTopicToGroup, getAllGroupsOfSelectedTopics } = require('./tableFunc/Group_TopicFunc');
const { addPost, getPost, getAllPostsOfGroup, updatePost, deletePost, getAllFlaggedPostOfGroup } = require('./tableFunc/PostsFunc');
const { addComment, getAllCommentsOfPost, deleteComment } = require('./tableFunc/CommentsFunc');
const { addHidePost, getAllHiddenPostsOfUser, getAllHiddenPostOfGroup } = require('./tableFunc/HidePostsFunc');
const { addChatsGroup } = require('./tableFunc/ChatsGroupFunc');
const { addUserToChatsGroup, getAllUsersOfChatsGroup, getAllChatsGroupForUser, deleteUserFromChatsGroup } = require('./tableFunc/User_ChatsGroupFunc');
const { addChatsMessage, getAllChatsMessageOfChatsGroup, getLatestChatsMessageOfChatsGroup } = require('./tableFunc/ChatsMessageFunc');
const { addNotification, getAllNotificationsOfUser, updateNotification } = require('./tableFunc/NotificationsFunc');
const { addAdminNotification, getAllAdminNotificationsOfGroup, updateAdminNotification } = require('./tableFunc/AdminNotificationsFunc');
const { sortGroupsByNumberOfUsers, sortGroupsByNumberOfPosts, sortGroupsByLatestPosts, suggestedGroupsForUser } = require('./tableFunc/SortGroupsFunc');

// Connect to our db on the cloud
const connect = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
    });
    // Connected to db
    // console.log(`Connected to database: ${connection.connection.config.database}`);
    return connection;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

module.exports = {
  connect,
  addUser, getUser, getUserById, getAllUsers, updateUser, deleteUser, getFriends,
  getAuth, updateAuth,
  addGroup, getGroup, getAllGroups, updateGroup, getGroupsById,
  addUserToGroup, getAllUsersFromGroup, updateUserToGroup, getAllAdminsFromGroup, deleteUserFromGroup,
  addTopic, getTopics,
  addTopicToUser, deleteTopicFromUser, getAllTopicsOfUser,
  addTopicToGroup, getAllGroupsOfSelectedTopics,
  addPost, getPost, getAllPostsOfGroup, updatePost, deletePost, getAllFlaggedPostOfGroup,
  addComment, getAllCommentsOfPost, deleteComment,
  addHidePost, getAllHiddenPostsOfUser, getAllHiddenPostOfGroup,
  addChatsGroup,
  addUserToChatsGroup, getAllUsersOfChatsGroup, getAllChatsGroupForUser, deleteUserFromChatsGroup,
  addChatsMessage, getAllChatsMessageOfChatsGroup, getLatestChatsMessageOfChatsGroup,
  addNotification, getAllNotificationsOfUser, updateNotification,
  addAdminNotification, getAllAdminNotificationsOfGroup, updateAdminNotification,
  sortGroupsByNumberOfUsers, sortGroupsByNumberOfPosts, sortGroupsByLatestPosts, suggestedGroupsForUser,
};