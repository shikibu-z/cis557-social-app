// hide a post for a user
const addHidePost = async (db, idUser, idPost) => {
  const query = 'INSERT  INTO app.HidePosts (idUser, idPosts) \
  VALUES(?, ?)';
  const params = [idUser, idPost];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all hidden posts of a user
const getAllHiddenPostsOfUser = async (db, idUser) => {
  const query = 'SELECT * FROM app.HidePosts WHERE idUser = ?';
  try {
    const [rows] = await db.execute(query, [idUser]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all hidden posts of a group
const getAllHiddenPostOfGroup = async (db, idGroup) => {
  try {
    const query = 'SELECT DISTINCT idPosts FROM (SELECT * FROM app.HidePosts) a \
    JOIN (SELECT idUser FROM app.User_Group WHERE idGroup = ?) b \
    ON a.idUser = b.idUser';
    const params = [idGroup];
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}


module.exports = {
  addHidePost, getAllHiddenPostsOfUser, getAllHiddenPostOfGroup
}