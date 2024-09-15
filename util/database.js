const {MongoClient} = require('mongodb');
const dbClient = new MongoClient('mongodb://localhost:27017');

let _db;
const mongoConnect = dbClient
.connect()
.then(resp => {
    console.log(resp);
    _db = resp.db('duaess');
})
.catch(err => {
    console.log(err);
    throw err;
})

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
};

module.exports.dbConnect = mongoConnect;
module.exports.getDb = getDb;