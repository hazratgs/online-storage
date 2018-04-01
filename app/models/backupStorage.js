const db = require('../../db')

const BackupStorageSchema = new db.mongoose.Schema({
  connect: { type: String, required: [true, 'connectRequired'] },
  storage: { type: Object, default: {} },
  important: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
})

exports.BackupStorage = db.connect.model('BackupStorage', BackupStorageSchema)
