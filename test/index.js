const app = require('../index')
const request = require('supertest')
const expect = require('chai').expect

const isGuid = require('is-guid').isGuid
const password = 'qwerty'
const user = { name: 'hazratgs', age: 25, city: 'Derbent' }

const token = {
  token: null,
  refreshToken: null,
  tokenPassword: null,
  tokenDomain: null
}

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
        token.token = res.body.data.token
        token.refreshToken = res.body.data.refreshToken
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
        token.tokenPassword = res.body.data.token
        done()
      })
  })
})

describe('POST /', () => {
  it('write a storage with domain access', done => {
    request(app)
      .post(`/${token.token}`)
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
      .post(`/${token.tokenPassword}`)
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
      .get(`/${token.token}/name`)
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
      .get(`/${token.token}`)
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

describe('POST /:token/refresh', () => {
  it('update token', done => {
    request(app)
      .post(`/${token.token}/refresh`)
      .send({ refreshToken: token.refreshToken })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        token.token = res.body.data
        done()
      })
  })
})

describe('Domain Access', () => {
  it('creating a token and accessing it from an unresolved domain', done => {
    request(app)
      .post('/create')
      .send({ domains: 'google.com', backup: true })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data.domains).to.include('google.com')
        token.tokenDomain = res.body.data.token
        done()
      })
  })

  it('prevent write to the vault from an unresolved domain', done => {
    request(app)
      .post(`/${token.tokenDomain}`)
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

describe('POST /:token/backup', () => {
  it('create a backup copy', done => {
    request(app)
      .post(`/${token.token}/backup`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })

  it('get a list of backups', done => {
    request(app)
      .get(`/${token.token}/backup/list`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        expect(res.body.data).to.be.an('array')
        done()
      })
  })
})

describe('DELETE /', () => {
  it('remove name', done => {
    request(app)
      .delete(`/${token.token}/name`)
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
      .delete(`/${token.token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw new Error(err.message)
        expect(res.body.status).to.be.true
        done()
      })
  })
})
