// Add a post to group
const addPost = async (db, newPost) => {
  const query = 'INSERT  INTO app.Posts (idUser, idGroup, timestamp, flagged, title, content, attachment) \
  VALUES(?, ?, ?, ?, ?, ?, ?)';
  const params = [newPost.idUser, newPost.idGroup, newPost.timestamp, newPost.flagged, newPost.title, newPost.content, newPost.attachment];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get a post by id
const getPost = async (db, idPosts) => {
  const query = 'SELECT * FROM app.Posts WHERE idPosts = ?';
  try {
    const row = await db.execute(query, [idPosts]);
    return row[0][0];
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all posts of a group order by timestamp
const getAllPostsOfGroup = async (db, idGroup) => {
  const query = 'SELECT * FROM app.Posts WHERE idGroup = ? ORDER BY timestamp DESC';
  try {
    const [rows] = await db.execute(query, [idGroup]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// update a post's flagged status
const updatePost = async (db, idPosts, flagged) => {
  try {
    const query = 'UPDATE app.Posts SET flagged = ? WHERE idPosts = ?';
    const params = [flagged, idPosts];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// delete a post
const deletePost = async (db, idPosts) => {
  try {
    const [rows] = await db.execute('SELECT * FROM \
                  ((SELECT * From app.Groups) a JOIN (SELECT * From app.Posts) b ON a.idGroups = b.idGroup) where idPosts = ?', [idPosts]);
    const result = await db.execute('UPDATE app.Groups SET deletedPosts = ? WHERE idGroups = ?', [rows[0].deletedPosts + 1, rows[0].idGroup]);
    const query = 'DELETE FROM app.Posts WHERE idPosts = ?';
    const [row] = await db.execute(query, [idPosts]);
    return row.affectedRows; // number of records deleted
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

const getAllFlaggedPostOfGroup = async (db, idGroup) => {
  try {
    const query = 'SELECT idPosts FROM app.Posts WHERE idGroup = ? AND flagged = 1';
    const [rows] = await db.execute(query, [idGroup]);
    return rows;
  } catch (error) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}

module.exports = {
  addPost, getPost, getAllPostsOfGroup, updatePost, deletePost, getAllFlaggedPostOfGroup
};
