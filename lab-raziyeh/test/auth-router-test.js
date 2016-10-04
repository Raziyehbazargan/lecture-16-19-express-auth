'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = require('../model/user.js');
const debug = require('debug')('slug:test');

mongoose.Promise = Promise;

const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;
const exampleUser = {
  username: 'slug',
  password: '1234',
  email: 'slug@slug.slime'
};

describe('Testing running Server', function() {
  before((done) => {
    if (! server.isRunning) {
      server.listen(process.env.PORT, () => {
        server.isRunning = true;
        debug(`server up ::: ${process.env.PORT}`);
        done();
      });
      return;
    }
    done();
  });

  it('expect  to show server is running on: ', () => {
    expect(server.isRunning).to.be.true;
  });
});

describe('testing auth-router', function(){
  describe('testing POST /api/signup', function(){
    describe('with valid body', function(){
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
  });

  describe('testing GET /api/signup', function(){
    describe('with valid body', function(){
      before( done => {
        var user  =  new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempuser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', (done) => {
        request.get(`${url}/api/login`)
        .auth('slug', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.text', res.text);
          expect(res.status).to.equal(200);
          expect(!!res.text).to.equal(true);
          done();
        });
      });
    });
  });
});
