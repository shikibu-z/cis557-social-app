// add a chatsmessage
const addChatsMessage = async (db, newMessage) => {
  const query = 'INSERT  INTO app.ChatsMessage (idUser, idChatsGroup, timestamp, message, attachment) \
  VALUES(?, ?, ?, ?, ?)';
  const params = [newMessage.idUser, newMessage.idChatsGroup, newMessage.timestamp, newMessage.message, newMessage.attachment];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all chatsmessage of a chatsgroup order by timestamp (earliest to latest)
const getAllChatsMessageOfChatsGroup = async (db, idChatsGroup) => {
  const query = 'SELECT * FROM app.ChatsMessage WHERE idChatsGroup = ? ORDER BY timestamp ASC';
  try {
    const [rows] = await db.execute(query, [idChatsGroup]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get the one latest chatsmessage of a chatsgroup (for ordering chats for display)
const getLatestChatsMessageOfChatsGroup = async (db, idChatsGroup) => {
  const query = 'SELECT * FROM app.ChatsMessage WHERE idChatsGroup = ? ORDER BY timestamp DESC LIMIT 1';
  try {
    const [rows] = await db.execute(query, [idChatsGroup]);
    return rows[0];
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addChatsMessage, getAllChatsMessageOfChatsGroup, getLatestChatsMessageOfChatsGroup
}