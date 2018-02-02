const db = require('../../db');

const StorageSchema = new db.mongoose.Schema({
    token: { type: String, required: [true, "tokenRequired"] },
    storage: { type: Object, default: {} }
})

exports.Storage = db.connect.model("Storage", StorageSchema)