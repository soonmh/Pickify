const { MongoClient } = require('mongodb')

let dbConnection
const URL = process.env.MONGO_URL

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(URL)
          .then((client) => {
            dbConnection = client.db()
            return cb()
          })
          .catch(err => {
            console.log(err)
            return cb(err)
          })
    },

    getDb: () => dbConnection
}