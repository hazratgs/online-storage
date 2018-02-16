const cron = require('node-cron')
const db = require('../db')
const conf = require('../conf.json')

// Models
const TokenModel = require('./models/token');
const StorageModel = require('./models/storage')
const BackupStorageModel = require('./models/backupStorage')

// Резервные копии хранилища
cron.schedule('0 */2 * * *', async () => {
  const tokens = await TokenModel.Token.find({ backup: true })
  tokens.map(async token => {
    try {
      const storage = await StorageModel.Storage.findOne({ token: token.token })
      if (!storage) throw new Error()

      // Формирование структуры бэкапа, дата использутся как идентификатор
      const backupStorage = {
        token: token.token,
        storage: storage.storage,
        date: Date.now()
      }

      // Save to db
      await new BackupStorageModel.BackupStorage(backupStorage).save()
    } catch (e) {
      // Ошибка соединения или Хранилища нет
    }
  })
})

// Удаляем устаревшие копии хранилища
cron.schedule('0 */6 * * *', async () => {
  try {
    // Срок жизни бэкапа
    const lifetime = Date.now() - conf.backup.lifetime
    // Удаление старых бэкапов
    await BackupStorageModel.BackupStorage.where('date').lt(lifetime).remove()
  } catch (e) {
    // Ошибка соединения или данных нет в БД
  }
})
