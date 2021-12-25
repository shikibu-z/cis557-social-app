// add a user
const addUser = async (db, newUser) => {
  const query1 = 'INSERT  INTO app.Users (username, email, registrationDate, gender, profilePhoto) \
  VALUES(?, ?, ?, ?, ?)';
  const params1 = [newUser.username, newUser.email, newUser.registrationDate, newUser.gender, newUser.profilePhoto];
  try {
    const row1 = await db.execute(query1, params1);
    const id = row1[0].insertId;
    const query2 = 'INSERT INTO app.Authentication (idUsers, password_hash) \
  VALUES(?, ?)';
    const params2 = [id, newUser.password_hash];
    await db.execute(query2, params2);
    return id; // return id of new record
  } catch (err) {
    throw new Error('Error executing the query');
  }
};

// get user by username
const getUser = async (db, username) => {
  try {
    const query = 'SELECT * FROM app.Users WHERE username = ?';
    const params = [username];
    const row = await db.execute(query, params);
    return row[0][0];
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get user by id
const getUserById = async (db, id) => {
  try {
    const query = 'SELECT * FROM app.Users WHERE idUsers = ?';
    const params = [id];
    const row = await db.execute(query, params);
    return row[0][0];
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all users
const getAllUsers = async (db) => {
  try {
    const query = 'SELECT * FROM app.Users';
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// update user info by id
const updateUser = async (db, id, User) => {
  try {
    const query = 'UPDATE app.Users SET profilePhoto = ? WHERE idUsers = ?';
    const params = [User.photo, id];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// delete user by id
const deleteUser = async (db, id) => {
  try {
    const query = 'DELETE FROM app.Users WHERE idUsers = ?';
    const [row] = await db.execute(query, [id]);
    return row.affectedRows; // number of records deleted
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}

//get friends (people who share a common group)
const getFriends = async (db, id, groupid) => {
  try {
    const query1 = `WITH friends AS (SELECT DISTINCT(IdUser)
                    FROM app.User_Group
                    WHERE idGroup IN (
                              SELECT idGroup
                              FROM app.User_Group
                              WHERE idUser = ${id}
                                        ) AND idUser
                                        NOT IN (SELECT idUser
                                  FROM app.User_Group
                                                WHERE idGroup = ${groupid})
                ), 
                users AS (
                    SELECT *
                    FROM app.Users
                )
                SELECT *
                FROM friends
                JOIN users
                ON users.idUsers = friends.IdUser`;

    const query2 = `WITH friends AS (SELECT DISTINCT(IdUser)
                    FROM app.User_Group
                    WHERE idGroup IN (
                              SELECT idGroup
                              FROM app.User_Group
                              WHERE idUser = ${id}
                                        )
                ), 
                users AS (
                    SELECT *
                    FROM app.Users
                )
                SELECT *
                FROM friends
                JOIN users
                ON users.idUsers = friends.IdUser;`
    const query = groupid === -1 ? query2 : query1;

    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}

module.exports = {
  addUser, getUser, getUserById, getAllUsers, updateUser, deleteUser, getFriends
};