/*!
 * Kurtuba - key/value storage
 * Copyright(c) 2018 @hazratgs
 * MIT Licensed
*/

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const conf = require('./conf.json')

// Роуты приложения
const routes = require('./app/routes')

app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '5mb'
}))

// Основной роутер
routes(app)

// Запускаем сервер
app.listen(conf.port, () => console.log(`Express app run to port: ${conf.port}`))
