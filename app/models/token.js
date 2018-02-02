const db = require('../../db');

const TokenSchema = new db.mongoose.Schema({
  token: { type: String, required: [true, "tokenRequired"] }
})

exports.Token = db.connect.model("Token", TokenSchema)