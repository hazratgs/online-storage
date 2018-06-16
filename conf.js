module.exports = {
  "port": process.env.PORT || 3000,
  "mongoose": process.env.DATABASE_URL || "mongodb://localhost/onlineStorage",
  "mongooseTest": process.env.DATABASE_URL || "mongodb://localhost/onlineStorageTest",
  "backup": {
    "lifetime": process.env.BACKUP_LIFETIME || 86400000,
    "temporaryRestraint": process.env.BACKUP_TEMPORARY_RESTRAINT || 60000,
    "maxBackups": process.env.BACKUP_MAX_BACKUPS || 999
  }
}
