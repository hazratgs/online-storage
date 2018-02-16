const db = require('../db')
const guid = require('uuid/v4')

// Models
const TokenModel = require('./models/token');
const StorageModel = require('./models/storage')
const BackupStorageModel = require('./models/backupStorage')

// Checking the presence of the token in the Database
const tokenChecking = async token => {
  const findToken = await TokenModel.Token.findOne({ token: token })
  if (!findToken) throw new Error()
  return findToken
}

const getStorage = async token => {
  const storage = await StorageModel.Storage.findOne({ token: token })
  if (!storage) throw new Error()
  return storage
}

const domainVerification = (host, accessDomains) => {
  if (accessDomains.length && !accessDomains.includes(host)) {
    throw new Error()
  }
}

// Проверка на доступность резервного копирования
const backupEnabled = token => {
  if (!token.backup) throw new Error()
}

module.exports = app => {
  // Creating a token
  app.post('/create', async (req, res) => {
    try {
      // Дополнительные данные защиты хранилища
      const { domains, backup } = req.body

      // New unique uuid token
      const token = guid()

      // Данные по умолчанию
      const tokenParam = {
        token: token
      }

      // Cписок доменов для доступа к хранилищу
      if (domains) {
        // Если передан массив, сохраняем как есть
        if (Array.isArray(domains)) tokenParam.domains = domains
        // Если передана строка, оборачиваем в массив
        if (typeof domains === 'string') tokenParam.domains = [domains]
        // Если передано boolean true, сохраняем host
        if (typeof domains === 'boolean') tokenParam.domains = [req.hostname]
      }

      // Наличие резервного копирования
      if (backup) tokenParam.backup = true

      // Save to db
      await new TokenModel.Token(tokenParam).save()

      // Sending the token to the client
      res.json({ status: true, data: tokenParam })
    } catch (e) {
      res.status(500).send({ status: false, description: e.message })
    }
  })

  // Adding Data
  app.post('/:token/set', async (req, res) => {
    try {
      const { token } = req.params

      // Параметры токена
      const tokenParam = await tokenChecking(token)

      // Проверка доступа с домена, отправаивший запрос
      domainVerification(req.hostname, tokenParam.domains)

      // Data not sent
      if (Object.keys(req.body).length == 0) throw new Error()

      // Data in storage
      const storage = await StorageModel.Storage.findOne({ token: token })

      if (storage) {
        // Merging new and old data (overwriting)
        const data = { ...storage.storage, ...req.body }
        // Updating data
        await StorageModel.Storage.update({ token: token }, { $set: { storage: data } })
      } else {
        await new StorageModel.Storage({ token: token, storage: req.body }).save()
      }

      res.json({ status: true, message: 'Successfully added' })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Error adding data' })
    }
  })

  // Deletion of the property
  app.delete('/:token/remove/:key', async (req, res) => {
    try {
      const { token, key } = req.params

      // Параметры токена
      const tokenParam = await tokenChecking(token)

      // Проверка доступа с домена, отправаивший запрос
      domainVerification(req.hostname, tokenParam.domains)

      // Data in storage
      const storage = await getStorage(token)

      // If there is no key in storage
      if (!storage.storage[key]) throw new Error()

      const data = { ...storage.storage }
      delete data[key]

      // Updating the data
      await StorageModel.Storage.update({ token: token }, { $set: { storage: data } })

      res.json({ status: true, message: 'Successfully deleted' })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Uninstall error' })
    }
  })

  // Clearing the data store
  app.delete('/:token/delete', async (req, res) => {
    try {
      const { token } = req.params

      // Параметры токена
      const tokenParam = await tokenChecking(token)

      // Проверка доступа с домена, отправаивший запрос
      domainVerification(req.hostname, tokenParam.domains)

      // Delete storage
      await StorageModel.Storage.remove({ token: token })

      res.json({ status: true, message: 'Storage deleted' })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Uninstall error' })
    }
  })

  // Receiving data
  app.get('/:token/get/:key', async (req, res) => {
    try {
      const { token, key } = req.params
      await tokenChecking(token)

      // Data in storage
      const storage = await getStorage(token)

      // If there is no key in storage
      if (!storage.storage[key]) throw new Error()

      // We return the data to the user
      res.send({ status: true, data: storage.storage[key] })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Error' })
    }
  })

  // We return all data
  app.get('/:token/getAll', async (req, res) => {
    try {
      const { token } = req.params
      await tokenChecking(token)

      // Data in storage
      const storage = await getStorage(token)

      // We return all data
      return res.send({ status: true, data: storage.storage })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Error' })
    }
  })

  // Возвращает список доступных резервных копий хранилища
  app.post('/:token/backup', async (req, res) => {
    try {
      const { token } = req.params

      // Параметры токена
      const tokenParam = await tokenChecking(token)

      // Доступн к резервному копированию
      backupEnabled(tokenParam)

      // Доступные резервные копии
      const backups = await BackupStorageModel.BackupStorage.find({ token: token })

      // Отпрвляем пользователю дату, которую можно использовать как идентификатор
      return res.send({ status: true, data: backups.map(item => item.date) })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Error' })
    }
  })

  app.post('/:token/backup/:date', async (req, res) => {
    try {
      const { token, date } = req.params

      // Параметры токена
      const tokenParam = await tokenChecking(token)

      // Доступн к резервному копированию
      backupEnabled(tokenParam)

      // Поиск резервной копии
      const backup = await BackupStorageModel.BackupStorage.findOne({ token: token, date: date })

      // Восстанавливаем хранилище из резервной копии
      await StorageModel.Storage.update({ token: token }, { $set: { storage: backup.storage } })

      // Отпрвляем пользователю дату, которую можно использовать как идентификатор
      return res.send({ status: true, description: 'Успешно восстановлено' })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Error' })
    }
  })

  // If there are no handlers, 404
  app.use((req, res, next) => {
    res.status(404).send({ status: false, description: "Not Found: method not found" })
  })

  // There was an error
  app.use((err, req, res, next) => {
    res.status(err.status || 500).send({ status: false, description: 'Not Found: method not found' })
  })
}