// add a chats group
const addChatsGroup = async (db) => {
  const query = 'INSERT INTO app.ChatsGroup SET idChatsGroup = NULL';
  const row = await db.execute(query);
  const id = row[0].insertId;
  return id; // return id of new record
};

module.exports = {
  addChatsGroup
}