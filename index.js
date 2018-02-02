/*!
 * Kurtuba - key/value storage
 * Copyright(c) 2018 @hazratgs
 * MIT Licensed
*/

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const conf = require('./conf.json')
const cors = require('cors')

app.use(cors())

// Роуты приложения
const application = require('./app')

app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '5mb'
}))

// Основной роутер
application(app)

// Запускаем сервер
app.listen(conf.port, () => console.log(`Express app run to port: ${conf.port}`))
