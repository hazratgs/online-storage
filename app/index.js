const db = require('../db')
const uuid = require('uuid')
const MessageError = require('./messageError')
const passwordHash = require('password-hash')

// Models
const TokenModel = require('./models/token');
const StorageModel = require('./models/storage')
const BackupStorageModel = require('./models/backupStorage')

// Checking the presence of the token in the Database
const tokenChecking = async token => {
  const findToken = await TokenModel.Token.findOne({ token: token })
  if (!findToken) throw new MessageError('Token is not valid')
  return findToken
}

// Get the storage
const getStorage = async connect => {
  const storage = await StorageModel.Storage.findOne({ connect: connect })
  if (!storage) throw new MessageError('No storage found')
  return storage
}

// Access to storage from a domain
const domainVerification = (host, accessDomains) => {
  if (accessDomains.length && !accessDomains.includes(host)) {
    throw new MessageError('Access to the storage is forbidden')
  }
}

// Checking for the availability of backups
const backupEnabled = token => {
  if (!token.backup) throw new MessageError('Access to the backup is prohibited')
}

// Password access
const accessWithPassword = (token, password) => {
  // Password protection for writing is not installed
  if (!token.password) return false
  // If the password is not correct
  if (!password || !passwordHash.verify(password, token.password)) throw new MessageError('Incorrect password')
}

module.exports = app => {
  // Creating a token
  app.post('/create', async (req, res) => {
    try {
      // Additional storage protection data
      const { domains, backup, password } = req.body
      // New unique uuid token
      const token = uuid.v4()
      // A unique identifier for connecting the token to the storage 
      // as well as using it you can update the token
      const connect = uuid.v1()

      // Default
      const tokenParam = {
        token: token,
        connect: connect,
        refreshToken: connect
      }

      // The list of domains for accessing the repository
      if (domains) {
        // If an array is passed, store it as it is
        if (Array.isArray(domains)) tokenParam.domains = domains
        // If a string is passed, wrap it in an array
        if (typeof domains === 'string') tokenParam.domains = [domains]
        // If passed boolean true, save the host
        if (typeof domains === 'boolean') tokenParam.domains = [req.hostname]
      }

      // Availability of backup
      if (backup) tokenParam.backup = true

      // If a password is sent, we save it
      if (password) tokenParam.password = passwordHash.generate(password)

      // Save to db
      await new TokenModel.Token(tokenParam).save()

      // Sending the token to the client
      res.json({
        status: true,
        data: {
          token,
          refreshToken: connect,
          domains: tokenParam.domains,
          backup: tokenParam.backup,
          password: !!tokenParam.password
        }
      })
    } catch (e) {
      res.status(500).send({ status: false, description: 'Error: There was an error creating the token' })
    }
  })

  // Update token
  app.post('/:token/refresh', async (req, res) => {
    try {
      const { token } = req.params
      const { refreshToken } = req.body
      // Token data
      const tokenParam = await tokenChecking(token)

      // We check authenticity
      if (!refreshToken) throw new MessageError('Not passed RefreshToken')
      if (tokenParam.refreshToken !== refreshToken) throw new MessageError('RefreshToken is not valid')

      // New token
      const newToken = uuid.v4()

      // Update token
      await TokenModel.Token.update({ refreshToken: refreshToken }, { $set: { token: newToken } })

      // Sending the token to the client
      res.json({ status: true, data: newToken })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // Adding Data
  app.post('/:token', async (req, res) => {
    try {
      const { token } = req.params
      const { password } = req.headers
      // Token data
      const tokenParam = await tokenChecking(token)

      // Verify Password
      accessWithPassword(tokenParam, password)

      // Checking access from the domain that sent the request
      domainVerification(req.hostname, tokenParam.domains)

      // Data not sent
      if (Object.keys(req.body).length == 0) throw new MessageError('No data was transferred for writing')

      // Data in storage
      const storage = await StorageModel.Storage.findOne({ connect: tokenParam.connect })

      if (storage) {
        // Merging new and old data (overwriting)
        const data = { ...storage.storage, ...req.body }
        // Updating data
        await StorageModel.Storage.update({ connect: tokenParam.connect }, { $set: { storage: data } })
      } else {
        await new StorageModel.Storage({ connect: tokenParam.connect, storage: req.body }).save()
      }

      res.json({ status: true, message: 'Successfully added' })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // Clearing the data store
  app.delete('/:token', async (req, res) => {
    try {
      const { token } = req.params
      const { password } = req.headers
      // Token data
      const tokenParam = await tokenChecking(token)

      // Verify Password
      accessWithPassword(tokenParam, password)

      // Checking access from the domain that sent the request
      domainVerification(req.hostname, tokenParam.domains)

      // Delete storage
      await StorageModel.Storage.remove({ connect: tokenParam.connect })

      res.json({ status: true, message: 'Storage deleted' })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // Deletion of the property
  app.delete('/:token/:key', async (req, res) => {
    try {
      const { token, key } = req.params
      const { password } = req.headers
      // Token data
      const tokenParam = await tokenChecking(token)

      // Verify Password
      accessWithPassword(tokenParam, password)

      // Checking access from the domain that sent the request
      domainVerification(req.hostname, tokenParam.domains)

      // Data in storage
      const storage = await getStorage(tokenParam.connect)

      // If there is no key in storage
      if (!storage.storage[key]) throw new MessageError('There is no such entry in the storage')

      const data = { ...storage.storage }
      delete data[key]

      // Updating the data
      await StorageModel.Storage.update({ connect: tokenParam.connect }, { $set: { storage: data } })

      res.json({ status: true, message: 'Successfully deleted' })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // We return all data
  app.get('/:token', async (req, res) => {
    try {
      const { token } = req.params
      // Token data
      const tokenParam = await tokenChecking(token)

      // Data in storage
      const storage = await getStorage(tokenParam.connect)

      // We return all data
      return res.send({ status: true, data: storage.storage })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // Receiving data
  app.get('/:token/:key', async (req, res) => {
    try {
      const { token, key } = req.params
      // Token data
      const tokenParam = await tokenChecking(token)

      // Data in storage
      const storage = await getStorage(tokenParam.connect)

      // If there is no key in storage
      if (!storage.storage[key]) throw new MessageError('There is no such entry in the storage')

      // We return the data to the user
      res.send({ status: true, data: storage.storage[key] })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // Returns a list of available storage backups
  app.post('/:token/backup', async (req, res) => {
    try {
      const { token } = req.params
      const { password } = req.headers
      // Token data
      const tokenParam = await tokenChecking(token)

      // Verify Password
      accessWithPassword(tokenParam, password)

      // Available for backup
      backupEnabled(tokenParam)

      // Available backups
      const backups = await BackupStorageModel.BackupStorage.find({ connect: tokenParam.connect })

      // Send the user a date that can be used as an identifier
      return res.send({ status: true, data: backups.map(item => item.date) })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
    }
  })

  // Restoring the storage from a backup
  app.post('/:token/backup/:date', async (req, res) => {
    try {
      const { token, date } = req.params
      const { password } = req.headers
      // Token data
      const tokenParam = await tokenChecking(token)

      // Verify Password
      accessWithPassword(tokenParam, password)

      // Available for backup
      backupEnabled(tokenParam)

      // Find a backup
      const backup = await BackupStorageModel.BackupStorage.findOne({ connect: tokenParam.connect, date: date })

      // Restoring the storage from a backup
      await StorageModel.Storage.update({ connect: tokenParam.connect }, { $set: { storage: backup.storage } })

      // Send the user a date that can be used as an identifier
      return res.send({ status: true, description: 'Successfully restored' })
    } catch (e) {
      let message = 'Unexpected error'
      if (e instanceof MessageError) message = e.message
      res.status(500).send({ status: false, description: message })
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