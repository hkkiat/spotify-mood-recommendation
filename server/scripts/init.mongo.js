/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo moodtracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/moodtracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/moodtracker scripts/init.mongo.js
 */

db.moodlog.remove({});

/*
 * Enter the list of moods into the DB collection named 'moodlog'.
 * */

const moodlogs = [
  {
    email: "example2@example.com",
    logdatetime: ISODate("2024-04-01T15:35:31.585Z"),
    overallfeeling: "Not happy",
    happinesslevel: 0,
    mostimpact: "WORK"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-02T15:35:31.585Z"),
    overallfeeling: "I am feeling happy today",
    happinesslevel: 0.75,
    mostimpact: "FAMILY"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-03T15:35:31.585Z"),
    overallfeeling: "I am feeling happy today",
    happinesslevel: 1,
    mostimpact: "WORK"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-04T15:35:31.585Z"),
    overallfeeling: "sad",
    happinesslevel: 0.25,
    mostimpact: "OTHERS"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-05T15:35:31.585Z"),
    overallfeeling: "normal",
    happinesslevel: 0.5,
    mostimpact: "FAMILY"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-28T21:35:31.585Z"),
    overallfeeling: "I am feeling happy today",
    happinesslevel: 1,
    mostimpact: "FAMILY"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-22T15:35:31.585Z"),
    overallfeeling: "I am feeling happy today",
    happinesslevel: 0.75,
    mostimpact: "WORK"
  }, {
    email: "example@example.com",
    logdatetime: ISODate("2024-04-17T15:35:31.585Z"),
    overallfeeling: "NORMAL",
    happinesslevel: 0.5,
    mostimpact: "FAMILY"
  }, {
    email: "example2@example.com",
    logdatetime: ISODate("2024-04-19T15:35:31.585Z"),
    overallfeeling: "tired",
    happinesslevel: 0.25,
    mostimpact: "FRIENDS"
  },{
    email: "example@example.com",
    logdatetime: ISODate("2024-05-19T15:35:31.585Z"),
    overallfeeling: "cant wait to meet friends",
    happinesslevel: 0.25,
    mostimpact: "WORK"
  },{
    email: "example2@example.com",
    logdatetime: ISODate("2024-05-02T15:35:31.585Z"),
    overallfeeling: "tired",
    happinesslevel: 0.5,
    mostimpact: "FRIENDS"
  },{
    email: "example@example.com",
    logdatetime: ISODate("2024-05-21T15:35:31.585Z"),
    overallfeeling: "really tired",
    happinesslevel: 0.25,
    mostimpact: "FAMILY"
  },
];

db.moodlog.insertMany(moodlogs);

const count = db.moodlog.count();
print('Inserted', count, 'MoodLogs');

//The _id below is just a placeholder. The below collection, in fact, has only one row and one column. We can denote this by any name but we call this fixedindex.
db.counters.remove({ _id: 'fixedindex' });
db.counters.insert({ _id: 'fixedindex', current: count });

db.moodlog.createIndex({ email: 1 });
db.moodlog.createIndex({ logdatetime: 1 });
