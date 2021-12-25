// sort a list of groups by number of users
const sortGroupsByNumberOfUsers = async (db, groups) => {
  try {
    query = `SELECT idGroups,
               count(idUser) AS NumberOfUsers
             FROM (
               SELECT *
               FROM app.Groups
               LEFT JOIN app.User_Group ON app.Groups.idGroups = app.User_Group.idGroup
               ) TEMP
             WHERE idGroups IN ('` + groups.join(`', '`) + `')
             GROUP BY TEMP.idGroups
             ORDER BY NumberOfUsers DESC`;
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// sort a list of groups by number of posts
const sortGroupsByNumberOfPosts = async (db, groups) => {
  try {
    query = `SELECT idGroups,
               count(idPosts) AS NumberOfPosts
             FROM (
               SELECT *
               FROM app.Groups
               LEFT JOIN app.Posts ON app.Groups.idGroups = app.Posts.idGroup
               ) TEMP
             WHERE TEMP.idGroups IN ('` + groups.join(`', '`) + `')
             GROUP BY TEMP.idGroups
             ORDER BY NumberOfPosts DESC`;
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

// sort a list of groups by latest posts
const sortGroupsByLatestPosts = async (db, groups) => {
  try {
    query = `SELECT idGroups,
               max(TIMESTAMP) AS LatestPostTime
             FROM (
               SELECT *
               FROM app.Groups
               LEFT JOIN app.Posts ON app.Groups.idGroups = app.Posts.idGroup
               ) TEMP
             WHERE TEMP.idGroups IN ('` + groups.join(`', '`) + `')
             GROUP BY TEMP.idGroups
             ORDER BY LatestPostTime DESC`;
    const [rows] = await db.execute(query);
    return rows;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
};

const suggestedGroupsForUser = async (db, id) => {
  try {
    // get all the topics that the user's joined groups have
    query = `SELECT DISTINCT topic FROM app.Group_Topic WHERE idGroup IN (SELECT idGroup
    FROM app.User_Group WHERE idUser = ${id})`;
    const [res] = await db.execute(query);
    const topics = [];
    for (const e of res) {
      topics.push(e.topic)
    }
    // get all suggested groups that user haven't joined
    query2 = `SELECT * FROM app.Groups WHERE idGroups IN 
    (
      SELECT idGroup FROM app.Group_Topic WHERE topic IN 
      ('` + topics.join(`', '`) + `')
    ) AND idGroups NOT IN
    (
      SELECT idGroup FROM app.User_Group WHERE idUser = ${id}
    )
    `;
    const [rows] = await db.execute(query2);
    return rows;
  } catch (err) {
    console.log(`error: ${err.message}`);
    throw new Error('Error executing the query');
  }
}

module.exports = {
  sortGroupsByNumberOfUsers, sortGroupsByNumberOfPosts, sortGroupsByLatestPosts, suggestedGroupsForUser
}
