// THIS FILE CONTAINS THE QUERIES & MUTATIONS FOR MOOD LOGGING FEATURE

async function getAllMoodLogs(_, { email }, { db }) {
  /*
  Code to extract
  */

  try {
    console.log("Extracting all mood logs for... ", email)
    // Assuming db.collection('moodlog') retrieves mood logs from your database
    const moodLogs = await db.collection('moodlog').find({ email: email }).toArray();
    return moodLogs;
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    throw new Error('Failed to fetch mood logs');
  }

  /*End of Q2*/
}

async function createMoodLog(_, { moodlog }, { db }) {
  try {
    console.log(moodlog)
    const collection = db.collection('moodlog');

    // Insert the moodlog into the database
    const result = await collection.insertOne(moodlog);

    // Retrieve the inserted moodlog from the database
    const insertedMoodLog = await collection.findOne({ _id: result.insertedId });

    return insertedMoodLog;
  } catch (error) {
    throw new Error('Failed to create mood log: ' + error.message);
  }
}

module.exports = { getAllMoodLogs, createMoodLog };