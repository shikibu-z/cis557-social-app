// add a user to group
const addUserToGroup = async (db, newRelation) => {
  const query = 'INSERT  INTO app.User_Group (idUser, idGroup, role) \
  VALUES(?, ?, ?)';
  const params = [newRelation.idUser, newRelation.idGroup, newRelation.role];
  try {
    const row1 = await db.execute(query, params);
    const id = row1[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all users of a group
const getAllUsersFromGroup = async (db, idGroup) => {
  try {
    const query = `SELECT *
    FROM app.Users
    WHERE idUsers IN (SELECT idUser FROM app.User_Group WHERE idGroup = ${idGroup});`
    const [rows] = await db.execute(query, [idGroup]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// updates a user's role in a group
const updateUserToGroup = async (db, userid, groupid, role) => {
  try {
    const query = 'UPDATE app.User_Group SET role = ? WHERE idGroup = ? AND idUser = ?';
    const params = [role, groupid, userid];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch(err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all administrators and creator of a group
const getAllAdminsFromGroup = async (db, idGroup) => {
  try {
    const query = `SELECT *
    FROM app.Users
    JOIN (SELECT * FROM app.User_Group
        WHERE idGroup = ${idGroup} AND (role = 'admin' OR role = 'creator')) temp
    ON app.Users.idUsers = temp.idUser;`
    const [rows] = await db.execute(query, [idGroup]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// delete a user from a group
const deleteUserFromGroup = async (db, idUser, idGroup) => {
  try {
    const query = 'DELETE FROM app.User_Group WHERE idUser = ? AND idGroup = ?';
    const [row] = await db.execute(query, [idUser, idGroup]);
    return row.affectedRows; // number of records deleted
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all groups user is in
const getGroupsById = async (db, id) => {
  try {
    const query = `SELECT * FROM app.Groups
                    JOIN (
                    SELECT idGroup FROM app.User_Group WHERE idUser = ${id}) temp
                    ON app.Groups.idGroups = temp.idGroup
                    JOIN (
                    SELECT idGroup, COUNT(*) AS members
                    FROM app.User_Group
                    GROUP BY idGroup) member
                    ON member.idGroup = temp.idGroup;`;
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}

module.exports = {
  addUserToGroup, getAllUsersFromGroup, updateUserToGroup,
  getAllAdminsFromGroup, deleteUserFromGroup, getGroupsById
};