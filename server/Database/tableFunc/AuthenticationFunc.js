// get user auth by id
const getAuth = async (db, id) => {
  try {
    const query = 'select * from app.Authentication where idUsers = ?';
    const params = [id];
    const row = await db.execute(query, params);
    return row[0][0];
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// update auth by id
const updateAuth = async (db, id, password_hash) => {
  try {
    const query = 'UPDATE app.Authentication SET password_hash = ? WHERE idUsers = ?';
    const params = [password_hash, id];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  getAuth, updateAuth,
};