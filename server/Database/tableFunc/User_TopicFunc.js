// add a topic user relation (interest)
const addTopicToUser = async (db, idUser, topic) => {
  const query = 'INSERT  INTO app.User_Topic (idUser, topic) \
  VALUES(?, ?)';
  const params = [idUser, topic];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// delete topic user relation (interest)
const deleteTopicFromUser = async (db, idUser, topic) => {
  try {
    const query = 'DELETE FROM app.User_Topic WHERE idUser = ? AND topic = ?';
    const [row] = await db.execute(query, [idUser, topic]);
    return row.affectedRows; // number of records deleted
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all topics a user is interested in
const getAllTopicsOfUser = async (db, idUser) => {
  try {
    const query = 'SELECT * FROM app.User_Topic WHERE idUser = ?';
    const [rows] = await db.execute(query, [idUser]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addTopicToUser, deleteTopicFromUser, getAllTopicsOfUser,
}
