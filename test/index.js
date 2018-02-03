require('../index')
const chai = require('chai')
const conf = require('../conf.json')
const axios = require('axios')
const isGuid = require('is-guid').isGuid

// Models
const TokenModel = require('../app//models/token');
const StorageModel = require('../app/models/storage')

// New token for test
let token = null

describe('POST /create', () => {
  it('Create a new token', done => {
    axios.post(`http://localhost:${conf.port}/create`)
      .then(res => {
        if (res.data.status && isGuid(res.data.data)) {
          token = res.data.data
          console.log('New token: ', token)
          done()
        }
      })
  })
})

describe('POST /set', () => {
  it('Write a new value', done => {
    axios.post(`http://localhost:${conf.port}/${token}/set`, {
      counter: 1
    })
      .then(res => done())
  })
})

describe('GET /get', () => {
  it('Get counter value', done => {
    axios.get(`http://localhost:${conf.port}/${token}/get/counter`)
      .then(res => {
        if (res.data.status && res.data.data) {
          console.log('Counter: ', res.data.data)
          done()
        }
      })
  })
})

describe('UPDATE /update', () => {
  it('Update counter', done => {
    axios.post(`http://localhost:${conf.port}/${token}/set`, {
      counter: 2
    })
      .then(res => {
        if (res.data.status) {
          axios.get(`http://localhost:${conf.port}/${token}/get/counter`)
            .then(res => {
              if (res.data.status && res.data.data === 2) {
                console.log('Counter: ', res.data.data)
                done()
              }
            })
        }
      })
  })
})

describe('DELETE /remove', () => {
  it('Remove counter', done => {
    axios.delete(`http://localhost:${conf.port}/${token}/remove/counter`)
      .then(res => {
        if (res.data.status) {
          axios.get(`http://localhost:${conf.port}/${token}/get/counter`)
            .catch(e => done())
        }
      })
  })
})

