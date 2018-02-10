const db = require('../../db');

const TokenSchema = new db.mongoose.Schema({
  token: { type: String, required: [true, "tokenRequired"] },
  domains: { type: Array, default: [] }
})

exports.Token = db.connect.model("Token", TokenSchema)