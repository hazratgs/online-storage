const db = require('../../db')

const StorageSchema = new db.mongoose.Schema({
  connect: { type: String, required: [true, 'connectRequired'] },
  storage: { type: Object, default: {} }
})

exports.Storage = db.connect.model('Storage', StorageSchema)
