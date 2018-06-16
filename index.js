/*!
 * onlineStorage - free cloud key/value storage
 * Copyright(c) 2018 @hazratgs
 * MIT Licensed
*/
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const conf = require('./conf')
const cors = require('cors')

app.use(cors())

app.use(bodyParser.json({ limit: '150kb' }))
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '150kb'
  })
)

// Routes
const application = require('./app')(app)

// Backup Storage
const backup = require('./app/backupStorage')

// Start server
app.listen(conf.port, () =>
  console.log(`Express app run to port: ${conf.port}`)
)

// Return app for test
module.exports = app
