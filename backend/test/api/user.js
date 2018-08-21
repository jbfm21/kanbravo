'use strict';

var mongoose = require('mongoose');
var appServer = require('../../main/app');
var supertest = require('supertest')('http://localhost:3000');
var describe = require('mocha').describe;
var it = require('mocha').it;
var before = require('mocha').before;
var after = require('mocha').after;

var userFixture = require('../fixtures/user-fixture');
var messages = require('../../main/locales/pt-br.json');
var scenario = require('../utils/scenario')(supertest);
var dbUtils = require('../utils/db-util');
var factory = require('../fixtures/auto-fixture');
var config = require('konfig')({path: __dirname.replace('test\\api', 'main') + '/config'}).app;

var con = null;

let userFixtures = null;
var createFixtures = function (done)
{
    let createFixtureCallback = (err, returnedFixtures) =>
    {
        userFixtures = returnedFixtures;
        done(err);
    };
    userFixture.createUserFixtures(createFixtureCallback.bind(this));
};

var createRandomEntity = function (userNameLength, givenNameLength, surnameLength, nicknameLength)
{
    return {username: factory.createEmail(userNameLength, 5), givenname: factory.createString(givenNameLength), surname: factory.createString(surnameLength), nickname: factory.createString(nicknameLength)};
};

describe('api-user', function ()
{
    this.timeout(50000);
    before('clearing database:' + config.db.mongodb, function (done)
    {
        con = mongoose.createConnection(config.db.mongodb);
        con.on('open', function () { dbUtils.clearDatabase(con, done); });
    });

    /*************************************************************************************************************************************************************************/
    // SIGNUP
    /*************************************************************************************************************************************************************************/
    describe('auth/signup', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });
        let runScenario = () => scenario.create('/auth/signup').when.post();
        it(('NULL data'), (done) => { runScenario().with.data(null).then.expect.invalidRequest.run(done);});
        it(('E-MAIL not filled'), (done) => { runScenario().with.data(createRandomEntity(0, 10, 10, 5)).then.expect.invalidData('username', messages.AUTH_INVALID_USERNAME).run(done);});
        it(('GIVEN NAME not filled'), (done) => { runScenario().with.data(createRandomEntity(10, 0, 10, 5)).then.expect.invalidData('givenname', messages.AUTH_INVALID_GIVENNAME).run(done);});
        it(('SURNAME not filled'), (done) => { runScenario().with.data(createRandomEntity(10, 10, 0, 5)).then.expect.invalidData('surname', messages.AUTH_INVALID_SURNAME).run(done);});
        it(('NICKNAME not filled'), (done) => {runScenario().with.data(createRandomEntity(10, 10, 10, 0)).then.expect.invalidData('nickname', messages.AUTH_INVALID_NICKNAME).run(done);});
        it(('E-MAIL has more than x chars'), (done) => { runScenario().with.data(createRandomEntity(200, 10, 10, 5)).then.expect.invalidData('username', messages.AUTH_INVALID_USERNAME).run(done);});
        it(('GIVEN NAME has more than x chars'), (done) => { runScenario().with.data(createRandomEntity(10, 41, 10, 5)).then.expect.invalidData('givenname', messages.AUTH_INVALID_GIVENNAME).run(done);});
        it(('SURNAME has more than x chars'), (done) => {runScenario().with.data(createRandomEntity(10, 10, 41, 5)).then.expect.invalidData('surname', messages.AUTH_INVALID_SURNAME).run(done);});
        it(('NICKNAME has more than x chars'), (done) => { runScenario().with.data(createRandomEntity(10, 10, 10, 6)).then.expect.invalidData('nickname', messages.AUTH_INVALID_NICKNAME).run(done);});
        it(('NICKNAME has more than x chars'), (done) => { runScenario().with.data(createRandomEntity()).changeData({nickname: 'eb ac'}).then.expect.invalidData('nickname', messages.AUTH_INVALID_NICKNAME).run(done);});
        it(('E-MAIL is invalid'), (done) => { runScenario().data(createRandomEntity()).changeData({username: 'asdadasd'}).then.expect.invalidData('username', messages.AUTH_INVALID_USERNAME).run(done);});
        it(('User already exists'), (done) => {runScenario().with.data(userFixtures[1]).changeData({_id: null, password: '123456'}).then.expect.invalidData('username', messages.AUTH_EMAIL_ALREADY_EXISTS, userFixtures[1].username).run(done);});
        it(('Nickname already exists'), (done) => { runScenario().with.data(userFixtures[1]).changeData({_id: null, username: 'aaaaa@aa.com', password: '123456'}).then.expect.invalidData('nickname', messages.AUTH_NICKNAME_ALREADY_EXISTS, userFixtures[1].nickname).run(done);});
        it(('Valid user'), (done) =>
        {
            let userToAdd = {givenname: 'novousuario', surname: 'novo', nickname: 'abcde', username: 'novo@novo.com', password: '123456'};
            let userToCheck = JSON.parse(JSON.stringify(userToAdd));
            delete userToCheck.password;
            runScenario().with.data(userToAdd).then.expect.successStatus.and.bodyDataHaveProperties(['salt', 'id', 'hash']).and.bodyDataEquals(userToCheck).run(done);
        });
    });

    /*************************************************************************************************************************************************************************/
    // LOGOUT
    /*************************************************************************************************************************************************************************/
    describe('auth/logout', function ()
    {
        var url = '/auth/logout';
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });
        it('Success Logout', function(done)
        {
            scenario.create(url).given.isAuthenticated(userFixtures[1]).when.get().then.expect.successStatus.and.message(messages.AUTH_LOG_OUT).run(done);
        });
    });

    /*************************************************************************************************************************************************************************/
    // LOGIN
    /*************************************************************************************************************************************************************************/
    describe('auth/login', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });
        let runScenario = () => scenario.create('/auth/login').when.post();
        it(('SEND NULL'), (done) => { runScenario().with.data(null).then.expect.status(401).and.message(messages.INVALID_AUTHENTICATION).run(done);});
        it('E-MAIL not filled', (done) => { runScenario().with.data({username: '', password: 'aaaaa'}).then.expect.status(401).and.message(messages.INVALID_AUTHENTICATION).run(done);});
        it('PASSWORD not filled', (done) => { runScenario().with.data({username: 'aaaa@aaa.com', password: ''}).then.expect.status(401).and.message(messages.INVALID_AUTHENTICATION).run(done);});
        it(('E-MAIL or PASSWORD is invalid'), (done) => {runScenario().with.data({username: 'aaaa@aaa.com', password: 'asdadasada'}).then.expect.status(401).and.message(messages.INVALID_AUTHENTICATION).run(done);});
        it(('Valid Login'), (done) => { runScenario().with.data(userFixtures[0]).then.expect.successStatus.and.bodyHaveProperties(['token']).run(done);});
    });
});

