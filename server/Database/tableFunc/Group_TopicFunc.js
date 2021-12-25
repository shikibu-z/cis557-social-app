// add a topic to a group
const addTopicToGroup = async (db, idGroup, topic) => {
  const query = 'INSERT  INTO app.Group_Topic (idGroup, topic) \
  VALUES(?, ?)';
  const params = [idGroup, topic];
  try {
    const row = await db.execute(query, params);
    const id = row[0].insertId;
    return id; // return id of new record
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all the groups associated with a selected list of topic, for filtering
const getAllGroupsOfSelectedTopics = async (db, topics) => {
  try {
    const query = "SELECT DISTINCT idGroup FROM app.Group_Topic WHERE topic IN ('" + topics.join("','") + "')";
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addTopicToGroup, getAllGroupsOfSelectedTopics,
};
