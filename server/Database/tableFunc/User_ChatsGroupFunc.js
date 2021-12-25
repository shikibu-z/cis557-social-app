// add a user to a chatsgroup
const addUserToChatsGroup = async (db, idChatsGroup, idUser) => {
  const query = 'INSERT  INTO app.User_ChatsGroup (idChatsGroup, idUser) \
  VALUES(?, ?)';
  const params = [idChatsGroup, idUser];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all users of a chatsgroup 
const getAllUsersOfChatsGroup = async (db, idChatsGroup) => {
  const query = 'SELECT * FROM app.User_ChatsGroup WHERE idChatsGroup = ?';
  try {
    const [rows] = await db.execute(query, [idChatsGroup]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all chatsgroup a user belongs in
const getAllChatsGroupForUser = async (db, idUser) => {
  const query = 'SELECT * FROM app.User_ChatsGroup WHERE idUser = ?';
  try {
    const [rows] = await db.execute(query, [idUser]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// delete a user from a chatsgroup 
const deleteUserFromChatsGroup = async (db, idChatsGroup, idUser) => {
  try {
    const query = 'DELETE FROM app.User_ChatsGroup WHERE idChatsGroup = ? AND idUser = ?';
    const [row] = await db.execute(query, [idChatsGroup, idUser]);
    return row.affectedRows; // number of records deleted
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addUserToChatsGroup, getAllUsersOfChatsGroup, getAllChatsGroupForUser, deleteUserFromChatsGroup
}