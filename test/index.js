const app = require('../index')
const request = require('supertest')
const expect = require('chai').expect

const conf = require('../conf.json')
const isGuid = require('is-guid').isGuid
const password = 'qwerty'
const user = { name: 'hazratgs', age: 25, city: 'Derbent' }

let token = null
let refreshToken = null
let tokenPassword = null

describe('POST /create', () => {
  it('create a new token', done => {
    request(app)
      .post('/create')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        if (!isGuid(res.body.data.token)) throw new Error('is token not guid')
        expect(res.body.status).to.be.true
        done()
      })
  })

  it('create a token with domain access', done => {
    request(app)
      .post('/create')
      .send({ domains: '127.0.0.1' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data.domains).to.include('127.0.0.1')
        token = res.body.data.token
        refreshToken = res.body.data.refreshToken
        done()
      })
  })

  it('create a token with a backup', done => {
    request(app)
      .post('/create')
      .send({ backup: true })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data.backup).to.be.true
        done()
      })
  })

  it('create a token with a backup and with domain access', done => {
    request(app)
      .post('/create')
      .send({ backup: true, domains: '127.0.0.1' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data.backup).to.be.true
        expect(res.body.data.domains).to.include('127.0.0.1')
        done()
      })
  })

  it('create a token with a password', done => {
    request(app)
      .post('/create')
      .send({ password })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data.password).to.be.true
        tokenPassword = res.body.data.token
        done()
      })
  })
})

describe('POST /', () => {
  it('write a storage with domain access', done => {
    request(app)
      .post(`/${token}`)
      .send(user)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })

  it('write a storage with password', done => {
    request(app)
      .post(`/${tokenPassword}`)
      .set('password', password)
      .send(user)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })
})

describe('GET /', () => {
  it('get the name from the repository', done => {
    request(app)
      .get(`/${token}/name`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data).to.equal(user.name)
        done()
      })
  })

  it('retrieve data from the repository', done => {
    request(app)
      .get(`/${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data).to.deep.equal(user)
        done()
      })
  })
})

describe('DELETE /', () => {
  it('remove name', done => {
    request(app)
      .delete(`/${token}/name`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })

  it('remove storage', done => {
    request(app)
      .delete(`/${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })
})

describe('POST /:token/refresh', () => {
  it('update token', done => {
    request(app)
      .post(`/${token}/refresh`)
      .send({ refreshToken })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })
})

describe('Domain Access', () => {
  it('creating a token and accessing it from an unresolved domain', done => {
    request(app)
      .post('/create')
      .send({ domains: 'google.com' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data.domains).to.include('google.com')
        token = res.body.data.token
        done()
      })
  })

  it('prevent write to the vault from an unresolved domain', done => {
    request(app)
      .post(`/${token}`)
      .send(user)
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.false
        done()
      })
  })
})
