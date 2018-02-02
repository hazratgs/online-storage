const db = require('../db')
const guid = require('uuid/v1')

// Models
const TokenModel = require('./models/token');
const StorageModel = require('./models/storage')

module.exports = app => {
	// Создание токена
	app.post('/create', async (req, res) => {
		try {
			// Новый уникальный uuid токен
			const token = guid()

			// Сохраняем в db
			await new TokenModel.Token({ token: token }).save()

			// Передача токена клиенту
			res.json({ status: true, token: token })
		} catch (e) {
			res.status(500).send({ status: false, description: 'Ошибка при создании токена' })
		}
	})

	// Добавление данных
	app.post('/:token/set', async (req, res) => {
		try {
			const token = req.params.token

			// Не переданы данные
			if (Object.keys(req.body).length == 0) throw new Error()

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
			res.status(500).send({ status: false, description: 'Ошибка добавления данных' })
		}
	})

	// Добавление данных
	app.get('/:token/get/:key', async (req, res) => {
		try {
			const token = req.params.token
			const key = req.params.key

			// Проверка токена 
			const findToken = await TokenModel.Token.findOne({ token: token })
			if (!findToken) throw new Error()

			// Данные в storage
			const storage = await StorageModel.Storage.findOne({ token: token })

			// Данных в storage нет
			if (!storage) throw new Error()

			// Отдаем все данные
			if (key === '__ALL__') {
				res.send({ status: true, data: storage.storage })
			}

			// Если нет key в storage
			if (!storage.storage[key]) throw new Error()

			// Отдаем данные пользователю
			res.send({ status: true, data: storage.storage[key] })
		} catch (e) {
			res.status(500).send({ status: false, description: 'Ошибка' })
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