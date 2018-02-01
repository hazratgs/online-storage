const db = require('../db')
const guid = require('uuid/v1')

// Models
const TokenModel = require('./models/token');

module.exports = app => {
	// Создание токена
	app.get('/create', (req, res) => {
		try {
			// Новый уникальный uuid токен
			const token = guid()

			// Сохраняем в db
			new TokenModel.Token({ token: token }).save()

			// Передача токена клиенту
			res.json({ status: true, token: token })

		} catch (e) {
			res.status(500).send({ status: false, description: 'Ошибка при создании токена' })
		}
	})

	// Если нет обработчиков, 404
	app.use((req, res, next) => {
		res.status(404).send({ status: false, description: "Not found" })
	})

	// Возникла ошибка
	app.use((err, req, res, next) => {
		res.status(err.status || 500).send({ status: false, description: err.message })
	})
}