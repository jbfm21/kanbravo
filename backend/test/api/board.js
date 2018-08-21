'use strict';

var mongoose = require('mongoose');
var appServer = require('../../main/app');
var supertest = require('supertest')('http://localhost:3000');
var describe = require('mocha').describe;
var it = require('mocha').it;
var before = require('mocha').before;
var after = require('mocha').after;

var boardFixtureClass = require('../fixtures/board-fixture');
var messages = require('../../main/locales/pt-br.json');
var sc = require('../utils/scenario')(supertest);
var dbUtils = require('../utils/db-util');
var factory = require('../fixtures/auto-fixture');
var config = require('konfig')({path: __dirname.replace('test\\api', 'main') + '/config'}).app;

var boardDb = require('../../main/db/board');

factory.define(boardDb.modelName, ['title', 'subtitle', 'description', 'icon']);

var con = null;

let boardFixtures = null;
let userFixtures = null;

var createFixtures = function (done)
{
    let createFixtureCallback = (err, returnedUserFixture, returnedBoardFixtures) =>
    {
        userFixtures = returnedUserFixture;
        boardFixtures = returnedBoardFixtures;
        done(err);
    };
    boardFixtureClass.createBoardFixtures(createFixtureCallback.bind(this));
};

var createRandomEntity = function (titleLength, subtitleLength, descriptionLength)
{
    return {title: factory.createString(titleLength), subtitle: factory.createString(subtitleLength), description: factory.createString(descriptionLength)};
};

var existInDataBaseValidateFn = function(response, scenario, nextValidation)
{
    boardDb.findById(response.body.data._id, function (err, found) { found._id.toString().should.be.equal(response.body.data._id); return nextValidation(null, response, scenario); });
};

describe('board-api', function ()
{
    this.timeout(50000);
    before('clearing database:' + config.db.mongodb, function (done)
    {
        con = mongoose.createConnection(config.db.mongodb);
        con.on('open', function () { dbUtils.clearDatabase(con, done); });
    });

    /*************************************************************************************************************************************************************************/
    // Find All
    /*************************************************************************************************************************************************************************/
    describe('findAll', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });
        let url = '/boards';
        it(('userNotAuthenticated'), (done) => { sc.create(url).given.when.get().then.expect.unauthorizedStatus.run(done);});
        it(('userWithoutEntities'), (done) => { sc.create(url).given.isAuthenticated(userFixtures[4]).when.get().then.expect.successStatus.and.isBodyDataEmptyArray().run(done);});
        it(('userWithOneEntity'), (done) => {
            let expectedEntities = [boardFixtures.boardEntity1.cloneFixture({numberOfMembers: 1})];
            sc.create(url).given.isAuthenticated(userFixtures[1]).when.get().then.expect.successStatus.and.containsEntities(expectedEntities).run(done);
        });
        it(('userWithTwoEntity'), (done) => {
            let expectedEntities = [
                boardFixtures.boardEntity2_1.cloneFixture({numberOfMembers: 2}),
                boardFixtures.boardEntity2_2.cloneFixture({numberOfMembers: 1})
            ];
            sc.create(url).given.isAuthenticated(userFixtures[2]).when.get().then.expect.successStatus.and.containsEntities(expectedEntities).run(done);
        });
     });

    /*************************************************************************************************************************************************************************/
    // FindByID
    /*************************************************************************************************************************************************************************/
     describe('findById', function ()
     {
        let urlTemplate = '/boards/:id';
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });
        it(('invalid board id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({id: '00000'}).then.expect.forbiddenError.run(done);});
        it(('Board that not belong to user'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[0]).when.get({id: boardFixtures.boardEntity1._id}).then.expect.forbiddenError.run(done);});
        it(('Board id not found'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[0]).when.get({id: '570c8901133418b019c212c8'}).then.expect.forbiddenError.run(done);});
        it(('Get Success- User 1'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[0]).when.get({id: boardFixtures.boardEntity0._id}).then.expect.successStatus.and.containsEntity(boardFixtures.boardEntity0).run(done);});
        it(('Get Success- User 2'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({id: boardFixtures.boardEntity1._id}).then.expect.successStatus.and.containsEntity(boardFixtures.boardEntity1).run(done);});
     });

    /*************************************************************************************************************************************************************************/
    // Add
    /*************************************************************************************************************************************************************************/
     describe('add', function ()
     {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });
        let runScenario = () => sc.create('/boards');
        it(('NULL data'), (done) => {runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(null).then.expect.invalidRequest.run(done);});
        it(('TITLE not filled'), (done) => { runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(createRandomEntity(0, 50, 500)).then.expect.invalidData('title', messages.INVALID_TITLE).run(done);});
        it(('SUBTITLE not filled'), (done) =>
        {
            let boardToAdd = createRandomEntity(50, 0, 500);
            runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(boardToAdd).then.expect.successAddStatus.and.bodyDataEquals(boardToAdd).run(done);
        });
        it(('DESCRIPTION not filled'), (done) =>
        {
            let boardToAdd = createRandomEntity(50, 50, 0);
            runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(boardToAdd).then.expect.successAddStatus.and.bodyDataEquals(boardToAdd).run(done);
        });
        it(('TITLE has more than x chars'), (done) => { runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(createRandomEntity(51, 50, 500)).then.expect.invalidData('title', messages.INVALID_TITLE).run(done);});
        it(('SUBTITLE has more than x chars'), (done) => { runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(createRandomEntity(50, 51, 500)).then.expect.invalidData('subtitle', messages.INVALID_SUBTITLE).run(done);});
        it(('DESCRIPTION has more than x chars'), (done) => { runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(createRandomEntity(50, 50, 501)).then.expect.invalidData('description', messages.INVALID_DESCRIPTION).run(done);});
        it(('VALID data'), (done) =>
        {
            let boardToAdd = createRandomEntity(50, 50, 500);
            runScenario().given.isAuthenticated(userFixtures[1]).when.post().with.data(boardToAdd).then.expect.successAddStatus.and.bodyDataEquals(boardToAdd).and.validate(existInDataBaseValidateFn).run(done);
        });
     });
});
