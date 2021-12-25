const axios = require('axios');

const domain = !process.env.NODE_ENV
  || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api' : '/api';

async function userRegister(userObject) {
  const url = `${domain}/registration`;
  const response = await axios.post(url, userObject).catch(() => null);
  if (response === null) {
    return { status: 409 };
  }
  return response;
}

async function resetPassword(userObject) {
  const url = `${domain}/resetPassword`;
  const response = await axios.put(url, userObject);
  return response;
}

async function userLogin(userInfo) {
  const url = `${domain}/login`;
  const response = await axios.post(url, userInfo).catch(() => null);
  if (response === null) {
    return { status: 401 };
  }
  return response;
}

async function fetchUserProfile(id) {
  const url = `${domain}/profile/${id}`;
  const response = await axios.get(url);
  return response;
}

async function fetchUserGroups(id) {
  const url = `${domain}/groupsbyId/${id}`;
  const response = await axios.get(url);
  return response;
}

async function editUserProfile(id, profile) {
  const url = `${domain}/profile/${id}/edit`;
  const response = await axios.put(url, profile);
  return response;
}

async function createGroup(group) {
  const url = `${domain}/groupCreation`;
  const response = await axios.post(url, group);
  return response;
}

// feature 20 fetchers
// create if there is no chats, then get chatsgroups
async function fetchChatsGroups(id, friendId) {
  if (friendId === -1) {
    return { data: [] };
  }

  const createChatUrl = `${domain}/chats`;
  await axios.post(createChatUrl, { curId: id, userId: friendId });
  const getChatsUrl = `${domain}/chats/${id}`;
  const response = await axios.get(getChatsUrl);
  return response;
}

// feature 20 fetchers
// get all chat messages in this chatsGroup
// order from new to old
async function fetchChatMessages(chatsGroupId) {
  const url = `${domain}/chat/${chatsGroupId}`;
  const response = await axios.get(url);
  return response;
}

// feature 20
// add a chat message to current chatsGroup
async function addChatMessage(chatsGroupId, userId, message, attachment) {
  const url = `${domain}/chat/${chatsGroupId}`;
  await axios.post(url, { userId, message, attachment });
}

async function fetchGroup(groupId) {
  const url = `${domain}/group/${groupId}`;
  const response = await axios.get(url);
  return response;
}

async function deleteAccount(i) {
  const url = `${domain}/deleteAccount`;
  const response = await axios.delete(url, { data: { id: i } });
  return response;
}

async function getAdmins(group) {
  const url = `${domain}/getAdmins/${group}`;
  const response = await axios.get(url);
  return response;
}

async function removeAdmin(obj) {
  const url = `${domain}/removeAdmin`;
  const response = await axios.put(url, obj);
  return response;
}

async function addAdmin(data) {
  const url = `${domain}/addAdmin`;
  const response = await axios.post(url, data);
  return response;
}

async function getFriends(id, groupid) {
  const url = `${domain}/friends/${id}/${groupid}`;
  const response = await axios.get(url);
  return response;
}

async function getGroupMembers(group) {
  const url = `${domain}/getGroupMembers/${group}`;
  const response = await axios.get(url);
  return response;
}

async function getAdminNotes(groupid) {
  const url = `${domain}/groupNotification/${groupid}`;
  const response = await axios.get(url);
  return response;
}

async function getTopics() {
  const url = `${domain}/topics`;
  const response = await axios.get(url);
  return response;
}

// this function now takes a parameter query, which should be 'uid' or 'uid?topic1=true...'
async function getPublicGroups(query) {
  const url = `${domain}/groups/${query}`;
  const response = await axios.get(url);
  return response;
}

async function getGroupInfo(userid, groupid) {
  const url = `${domain}/group/${groupid}/info/${userid}`;
  const response = await axios.get(url);
  return response;
}

async function joinRequest(obj, groupid) {
  const url = `${domain}/reqToJoinGroup/${groupid}`;
  const response = await axios.post(url, obj);
  return response;
}

async function resolveJoinRequest(obj, adminNoteId) {
  const url = `${domain}/solveJoinRequest/${adminNoteId}`;
  const response = await axios.put(url, obj);
  return response;
}

async function leaveGroup(groupid, obj) {
  const url = `${domain}/leaveGroup/${groupid}`;
  const response = await axios.delete(url, { data: obj });
  return response;
}

async function inviteUser(data) {
  const url = `${domain}/invite`;
  const response = await axios.post(url, data);
  return response;
}

async function addPost(groupid, data) {
  const url = `${domain}/group/${groupid}`;
  const response = await axios.post(url, data);
  return response;
}

async function getPosts(groupid, userid, page) {
  const url = `${domain}/group/${groupid}/posts/${userid}?page=${page}`;
  const response = await axios.get(url);
  return response;
}

async function getPostById(groupid, postid, userid) {
  const url = `${domain}/group/${groupid}/post/${postid}/${userid}`;
  const response = await axios.get(url);
  return response;
}

async function getCommentsOfPost(groupid, postid, userid) {
  const url = `${domain}/group/${groupid}/post/${postid}/comments/${userid}`;
  const response = await axios.get(url);
  return response;
}

async function postComment(groupid, postid, comment) {
  const url = `${domain}/group/${groupid}/post/${postid}`;
  const response = await axios.post(url, comment);
  return response;
}

async function deleteComment(groupid, postid, commentid) {
  const url = `${domain}/group/${groupid}/post/${postid}/comment/${commentid}`;
  const response = await axios.delete(url);
  return response;
}

async function hideOrFlagPost(groupid, postid, obj) {
  const url = `${domain}/group/${groupid}/post/${postid}`;
  const response = await axios.put(url, obj);
  return response;
}

async function getNotifications(userId) {
  const url = `${domain}/notification/${userId}`;
  const response = await axios.get(url);
  return response;
}

async function resolveJoinNotification(join) {
  const url = `${domain}/solveInvitation`;
  const response = await axios.put(url, join);
  return response;
}

async function resolveReadNotification(userId, obj) {
  const url = `${domain}/notification/${userId}`;
  const response = await axios.put(url, obj);
  return response;
}

async function deletePost(groupid, postid, userid) {
  const url = `${domain}/group/${groupid}/post/${postid}/${userid}`;
  const response = await axios.delete(url);
  return response;
}

async function getSortedGroups(query) {
  const url = `${domain}/getSortedGroups/${query}`;
  const response = await axios.get(url);
  return response;
}

async function getSuggestedGroups(userId) {
  const url = `${domain}/getSuggestedGroups/${userId}`;
  const response = await axios.get(url);
  return response;
}

async function getGroupAnalytic(idGroups) {
  const url = `${domain}/analytics/${idGroups}`;
  const response = await axios.get(url);
  return response;
}

async function mentionUser(authorId, receiverId, idGroups) {
  const url = `${domain}/mention/${idGroups}/${authorId}`;
  const response = await axios.post(url, { userId: receiverId });
  return response;
}

export {
  userRegister,
  resetPassword,
  userLogin,
  fetchUserProfile,
  fetchUserGroups,
  editUserProfile,
  createGroup,
  fetchGroup,
  deleteAccount,
  getAdmins,
  removeAdmin,
  addAdmin,
  getFriends,
  getGroupMembers,
  getAdminNotes,
  getTopics,
  getPublicGroups,
  getGroupInfo,
  joinRequest,
  resolveJoinRequest,
  leaveGroup,
  inviteUser,
  addPost,
  getPosts,
  getPostById,
  getCommentsOfPost,
  postComment,
  deleteComment,
  hideOrFlagPost,
  getNotifications,
  resolveJoinNotification,
  resolveReadNotification,
  deletePost,
  getSortedGroups,
  getSuggestedGroups,
  fetchChatsGroups,
  fetchChatMessages,
  addChatMessage,
  getGroupAnalytic,
  mentionUser,
};
