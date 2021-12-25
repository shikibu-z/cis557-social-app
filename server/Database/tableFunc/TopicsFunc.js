// add a topic
const addTopic = async (db, newTopic) => {
  const query = 'INSERT  INTO app.Topics (topic) \
  VALUES(?)';
  const params = [newTopic];
  try {
    const row = await db.execute(query, params);
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// get all the topics
const getTopics = async (db) => {
  const query = 'SELECT * FROM app.Topics';
  try {
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

module.exports = {
  addTopic, getTopics,
};
