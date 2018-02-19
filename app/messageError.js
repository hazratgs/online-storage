function MessageError(message) {
    this.name = 'MessageError'
    this.message = `Error: ${message}`
}

MessageError.prototype = Object.create(Error.prototype)
module.exports = MessageError