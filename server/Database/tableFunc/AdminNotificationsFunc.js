// add an adminNotification
const addAdminNotification = async (db, newAdminNotification) => {
  const query = 'INSERT  INTO app.AdminNotifications (idGroup, read_status, timestamp, type, action, idUser_Action, idPost_Action) \
  VALUES(?, ?, ?, ?, ?, ?, ?)';
  const params = [newAdminNotification.idGroup, newAdminNotification.read_status, newAdminNotification.timestamp, newAdminNotification.type, newAdminNotification.action, newAdminNotification.idUser_Action, newAdminNotification.idPost_Action];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all adminNotification of a group order by read and timestamp (unread first, then latest first)
const getAllAdminNotificationsOfGroup = async (db, idGroup) => {
  const query = 'SELECT * FROM app.AdminNotifications WHERE idGroup = ? ORDER BY read_status ASC, timestamp DESC';
  try {
    const [rows] = await db.execute(query, [idGroup]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// update read status of an adminNotification
const updateAdminNotification = async (db, idAdminNotification, read_status) => {
  try {
    const query = 'UPDATE app.AdminNotifications SET read_status = ? WHERE idAdminNotifications = ?';
    const params = [read_status, idAdminNotification];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addAdminNotification, getAllAdminNotificationsOfGroup, updateAdminNotification
}