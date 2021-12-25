// Add a comment to a post
const addComment = async (db, newComment) => {
  const query = 'INSERT  INTO app.Comments (idUser, idPost, timestamp, content) \
  VALUES(?, ?, ?, ?)';
  const params = [newComment.idUser, newComment.idPost, newComment.timestamp, newComment.content];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all comments of a post order by time desc
const getAllCommentsOfPost = async (db, idPost) => {
  const query = 'SELECT * FROM app.Comments WHERE idPost = ? ORDER BY timestamp DESC';
  try {
    const [rows] = await db.execute(query, [idPost]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// Delete a comment
const deleteComment = async (db, idComment) => {
  try {
    const query = 'DELETE FROM app.Comments WHERE idComments = ?';
    const [row] = await db.execute(query, [idComment]);
    return row.affectedRows; // number of records deleted
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addComment, getAllCommentsOfPost, deleteComment
}