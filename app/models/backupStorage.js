const db = require('../../db');

const BackupStorageSchema = new db.mongoose.Schema({
  token: { type: String, required: [true, "tokenRequired"] },
  storage: { type: Object, default: {} },
  date: { type: Date, default: Date.now }
})

exports.BackupStorage = db.connect.model("BackupStorage", BackupStorageSchema)