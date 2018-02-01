const mongoose = require('mongoose')
const conf = require('./conf.json')

mongoose.Promise = global.Promise

mongoose.connect(conf.mongoose)
const db = mongoose.connection

db.on('error', err => console.log(`connection error: ${err.message}`))

db.once('open', () => console.log('Connected to DB!'))

// MongoDB
exports.mongoose = mongoose

// This DB
exports.connect = db