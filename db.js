const { MongoClient } = require('mongodb')

let dbConnection
const URL = 'mongodb+srv://lauduanhang:qwer1234@cluster0.dadg8gh.mongodb.net/Pickify?retryWrites=true&w=majority&appName=Cluster0'


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