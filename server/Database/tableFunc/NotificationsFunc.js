// add a notification 
const addNotification = async (db, newNotification) => {
  const query = 'INSERT  INTO app.Notifications (idUser, read_status, timestamp, type, action, idUser_Action, idGroup_Action) \
  VALUES(?, ?, ?, ?, ?, ?, ?)';
  const params = [newNotification.idUser, newNotification.read_status, newNotification.timestamp, newNotification.type, newNotification.action, newNotification.idUser_Action, newNotification.idGroup_Action];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all notifications of a user order by read and timestamp (unread first, then latest first)
const getAllNotificationsOfUser = async (db, idUser) => {
  const query = 'SELECT * FROM app.Notifications WHERE idUser = ? ORDER BY read_status ASC, timestamp DESC';
  try {
    const [rows] = await db.execute(query, [idUser]);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// change the read status of a notification
const updateNotification = async (db, idNotifications, read_status) => {
  try {
    const query = 'UPDATE app.Notifications SET read_status = ? WHERE idNotifications = ?';
    const params = [read_status, idNotifications];
    const [row] = await db.execute(query, params);
    return row.affectedRows; // number of records updated
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addNotification, getAllNotificationsOfUser, updateNotification
}