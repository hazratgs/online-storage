const mongoose = require('mongoose')
const conf = require('./conf')
mongoose.Promise = global.Promise

mongoose.connect(process.env.TEST ? conf.mongooseTest : conf.mongoose)
const db = mongoose.connection

db.on('error', err => console.log('connection db error'))

// MongoDB
exports.mongoose = mongoose

// This DB
exports.connect = db
