const app = require('../index')
const request = require('supertest')
const expect = require('chai').expect

const conf = require('../conf.json')
const isGuid = require('is-guid').isGuid

describe('POST /create', () => {
  it('create a new token', done => {
    request(app)
      .post('/create')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (!isGuid(res.body.data.token)) throw new Error('is token not guid')
        done()
      })
  })

  it('create a token with domain access', done => {
    request(app)
      .post('/create')
      .send({ domains: 'localhost' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data.domains).to.include('localhost')
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
        expect(res.body.data.backup).to.be.true
        done()
      })
  })

  it('create a token with a backup and with domain access', done => {
    request(app)
      .post('/create')
      .send({ backup: true, domains: 'localhost' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body.data.backup).to.be.true
        expect(res.body.data.domains).to.include('localhost')
        done()
      })
  })
})
