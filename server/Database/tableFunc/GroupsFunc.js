// add a group
const addGroup = async (db, newGroup) => {
  const query = 'INSERT  INTO app.Groups (groupName, private, groupInfo, createDate, profilePhoto) \
  VALUES(?, ?, ?, ?, ?)';
  const params = [newGroup.groupName, newGroup.private, newGroup.groupInfo, newGroup.createDate, newGroup.profilePhoto];
  try {
    const row1 = await db.execute(query, params);
    const id = row1[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};


// get a group by id
const getGroup = async (db, id) => {
  try {
    const query = 'SELECT * FROM app.Groups WHERE idGroups = ?';
    const params = [id];
    const row = await db.execute(query, params);
    return row[0][0];
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}


// get all groups 
const getAllGroups = async (db) => {
  try {
    const query = 'SELECT * FROM app.Groups';
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// update a group
const updateGroup = async (db, id, Group) => {
  try {
    const query = 'UPDATE app.Groups SET groupInfo = ?, profilePhoto = ? WHERE idGroups = ?';
    const params = [Group.groupInfo, Group.profilePhoto, id];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addGroup, getGroup, getAllGroups, updateGroup
}