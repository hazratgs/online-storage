const db = require('../../db');

const TokenSchema = new db.mongoose.Schema({
  token: { type: String, required: [true, "tokenRequired"] },
  domains: { type: Array, default: [] },
  backup: { type: Boolean, default: false }
})

exports.Token = db.connect.model("Token", TokenSchema)