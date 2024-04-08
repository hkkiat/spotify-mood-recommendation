// THIS FILE CONTAINS THE QUERIES & MUTATIONS FOR MOOD LOGGING FEATURE

async function getAllMoodLogs(_, { email }, { db }) {
  /*
  Function to extract all moodlogs belonging to the user based on email address
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
  /* 
  Function to update moodlog if it exists, otherwise creates a new moodlog entry
  */
  try {
    let updatedMoodLog = await updateMoodLog(_, { moodlog }, { db });

    // If the update succeeds, return the updated mood log
    if (updatedMoodLog) {
      console.log("Mood log updated:", updatedMoodLog);
      return updatedMoodLog;
    } else {
      console.log("Creating moodlog...", moodlog)
      const collection = db.collection('moodlog');

      // Insert the moodlog into the database
      const result = await collection.insertOne(moodlog);

      // Retrieve the inserted moodlog from the database
      const insertedMoodLog = await collection.findOne({ _id: result.insertedId });

      return insertedMoodLog;
    }
  } catch (error) {
    throw new Error('Failed to create mood log: ' + error.message);
  }
}

async function getExistingMoodLog(_, { email, date }, { db }) {
  /* 
  Function to search for existing moodlog on the same day, returns if found
  */
  try {
    console.log(`Finding particular moodlog for user: ${email} on date: ${date}`)
    const collection = db.collection('moodlog');

    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000));

    // Insert the moodlog into the database
    const result = await collection.findOne({
      email: email,
      logdatetime: {
        $gte: startDate, // Start date
        $lt: endDate    // End date (exclusive)
      }
    })
    return result;
  } catch (error) {
    throw new Error('Failed to find moodlog: ' + error.message);
  }
}

async function updateMoodLog(_, { moodlog }, { db }) {
  /*
  Function to search for existing moodlog on the same day, updates it if it exists 
  */
  try {
    console.log(`Updating moodlog...`, moodlog);

    // Find the existing mood log in the database
    const existingMoodLog = await getExistingMoodLog(_, { email: moodlog.email, date: moodlog.logdatetime }, { db });

    // If an existing mood log is found, update it; otherwise, throw an error
    if (existingMoodLog) {
      const collection = db.collection('moodlog');

      // Update the existing mood log in the database
      await collection.updateOne(
        { _id: existingMoodLog._id },
        { $set: moodlog }
      );

      // Return the updated mood log
      return { ...existingMoodLog, ...moodlog };
    } else {
      console.log("No moodlog found to update")
    }
  } catch (error) {
    throw new Error('Failed to update mood log: ' + error.message);
  }
}

module.exports = { getAllMoodLogs, getExistingMoodLog, createMoodLog, updateMoodLog};