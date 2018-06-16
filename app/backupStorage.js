const cron = require('node-cron')
const db = require('../db')
const conf = require('../conf')

// Models
const TokenModel = require('./models/token')
const StorageModel = require('./models/storage')
const BackupStorageModel = require('./models/backupStorage')

// Backup storage
cron.schedule('0 */2 * * *', async () => {
  const tokens = await TokenModel.Token.find({ backup: true })
  tokens.map(async token => {
    try {
      const storage = await StorageModel.Storage.findOne({
        connect: token.connect
      })
      if (!storage) throw new Error()

      // Forming the backup structure, the date is used as an identifier
      const backupStorage = {
        connect: token.connect,
        storage: storage.storage,
        date: Date.now()
      }

      // Save to db
      await new BackupStorageModel.BackupStorage(backupStorage).save()
    } catch (e) {
      // Connection error or Vault not found
    }
  })
})

// Delete obsolete copies of the repository
cron.schedule('0 */6 * * *', async () => {
  try {
    // Backup time
    const lifetime = Date.now() - conf.backup.lifetime
    // Removing old backups
    await BackupStorageModel.BackupStorage
      .where('date')
      .lt(lifetime)
      .where('important')
      .equals(false)
      .remove()
  } catch (e) {
    // Connection error or no data in the database
  }
})
