const db = require('../db')
const guid = require('uuid/v1')

// Models
const TokenModel = require('./models/token');
const StorageModel = require('./models/storage')

module.exports = app => {
	// Создание токена
	app.post('/create', (req, res) => {
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

	// Добавление данных
	app.post('/set/:token', async (req, res) => {
		try {
			const token = req.params.token

			// Проверка токена 
			const findToken = await TokenModel.Token.findOne({ token: token })
			if (!findToken) throw new Error()

			// Данные в storage
			const storage = await StorageModel.Storage.findOne({ token: token })

			if (storage) {
				// Мердж новых и старых данных (перезапись)
				const data = { ...storage.storage, ...req.body }
				// Обновление данных
				await StorageModel.Storage.update({ token: token }, { $set: { storage: data } })
			} else {
				await new StorageModel.Storage({ token: token, storage: req.body }).save()
			}

			res.json({ status: true, message: 'Успешно добавлено' })
		} catch (e) {
			res.status(404).send({ status: false, description: 'Ошибка добавления данных' })
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