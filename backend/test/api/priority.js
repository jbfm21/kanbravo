'use strict';

var mongoose = require('mongoose');
var appServer = require('../../main/app');
var supertest = require('supertest')('http://localhost:3000');
var describe = require('mocha').describe;
var it = require('mocha').it;
var before = require('mocha').before;
var after = require('mocha').after;
var chai = require('chai');
var should = chai.should();

var boardChildFixtureClass = require('../fixtures/boardChild-fixture');
var messages = require('../../main/locales/pt-br.json');
var sc = require('../utils/scenario')(supertest);
var dbUtils = require('../utils/db-util');
var factory = require('../fixtures/auto-fixture');
var config = require('konfig')({path: __dirname.replace('test\\api', 'main') + '/config'}).app;

var entityDb = require('../../main/db/priority');
var schemaEntity = entityDb.modelName;

factory.define('Board', ['title', 'subtitle', 'description']);
factory.define(schemaEntity, ['nonce'.as(function(i) { return new mongoose.Types.ObjectId();}), 'title', 'policy', 'avatar', 'board']);
factory.define('avatarSchema', ['foreColor', 'backgroundColor', 'icon']);
var con = null;

let entityFixtures = null;
let userFixtures = null;

var createEntity = function(boardFixture)
{
    var entity = factory.create(schemaEntity);
    entity.boardId = (boardFixture) ? boardFixture._id : null;
    entity.icon = factory.create('avatarSchema');
    return entity;
};

var createRandomEntity = function (titleLength, policyLength, foreColorLength, backgroundColorLength, iconLength)
{
    return {title: factory.createString(titleLength), policy: factory.createString(policyLength), icon: {foreColor: factory.createString(foreColorLength), backgroundColor: factory.createString(backgroundColorLength), icon: factory.createString(iconLength)}};
};

var createFixtures = function (done)
{
    let createFixtureCallback = (err, returnedUserFixture, returnedPriorityFixtures) =>
    {
        userFixtures = returnedUserFixture;
        entityFixtures = returnedPriorityFixtures;
        done(err);
    };
    boardChildFixtureClass.createFixtures(schemaEntity, createEntity.bind(this), createFixtureCallback.bind(this));
};

var existInDataBaseValidateFn = function(response, scenario, nextValidation)
{
    entityDb.findById(response.body.data._id, function (err, found) { found._id.toString().should.be.equal(response.body.data._id); return nextValidation(null, response, scenario); });
};
var notExistInDataBaseValidateFn = function (response, scenario, nextValidation)
{
    entityDb.findById(scenario.urlParams.id, function (err, found) { should.not.exist(found); return nextValidation(null, response, scenario); });
};
var isEntityUpdateInDb = function (response, scenario, nextValidation)
{
    entityDb.findById(response.body.data._id, function (err, found)
    {
        found._id.toString().should.be.equal(response.body.data._id);
        found.title.should.be.equal(scenario.dataToSend.title);
        found.color.should.be.equal(scenario.dataToSend.color);
        found.icon.foreColor.should.be.equal(scenario.dataToSend.icon.foreColor);
        found.icon.backgroundColor.should.be.equal(scenario.dataToSend.icon.backgroundColor);
        found.icon.icon.should.be.equal(scenario.dataToSend.icon.icon);
        found.nonce.should.not.be.equal(scenario.dataToSend.nonce);
        return nextValidation(null, response, scenario);
    });
};


describe('priority-api', function ()
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

        let urlTemplate = '/boards/:boardId/priorities';

        it(('invalid board id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: '00000'}).then.expect.forbiddenError.run(done);});
        it(('Board that not belong to user'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[0]).when.get({boardId: entityFixtures.boardEntity2_1._id}).then.expect.forbiddenError.run(done);});
		it(('Board id not found'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: '570c8901133418b019c212c8'}).then.expect.forbiddenError.run(done);});
		it(('Board without entity'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[0]).when.get({boardId: entityFixtures.boardEntity0._id}).then.expect.successStatus.and.isBodyDataEmptyArray().run(done);});
		it(('Board with one entity'), (done) => {
            let expectedEntities = [entityFixtures.boardEntity1_Child1.cloneFixture()];
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: entityFixtures.boardEntity1._id}).then.expect.successStatus.and.containsEntities(expectedEntities).and.bodyHavePropertyValue('boardId', entityFixtures.boardEntity1._id).run(done);
        });
		it(('Board with two entity'), (done) => {
            let expectedEntities = [entityFixtures.boardEntity2_1_Child1.cloneFixture(), entityFixtures.boardEntity2_1_Child2.cloneFixture()];
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.get({boardId: entityFixtures.boardEntity2_1._id}).then.expect.successStatus.and.bodyHavePropertyValue('boardId', entityFixtures.boardEntity2_1._id).and.containsEntities(expectedEntities).run(done);
        });
     });

    /*************************************************************************************************************************************************************************/
    // FindByID
    /*************************************************************************************************************************************************************************/
    describe('findById', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });

        let urlTemplate = '/boards/:boardId/priorities/:id';
        it(('Invalid board id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: '00000', id: entityFixtures.boardEntity1_Child1._id}).then.expect.forbiddenError.run(done);});
		it(('Invalid entity id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: entityFixtures.boardEntity1._id, id: '0000'}).then.expect.invalidRequest.run(done);});
		it(('Board that not belong to user'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child1._id}).then.expect.forbiddenError.run(done);});
		it(('Board id not found'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.get({boardId: '570c8901133418b019c212c8', id: entityFixtures.boardEntity2_1_Child1._id}).then.expect.forbiddenError.run(done);});
		it(('Entity not belong to board'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.get({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_2_Child1._id}).then.expect.resourceNotFound.run(done);});

        it(('Get Success: board1 - child1'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.get({boardId: entityFixtures.boardEntity1._id, id: entityFixtures.boardEntity1_Child1._id}).then.expect.successStatus.and.containsEntity(entityFixtures.boardEntity1_Child1).run(done);});
        it(('Get Success: board2 - child1'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.get({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child1._id}).then.expect.successStatus.and.containsEntity(entityFixtures.boardEntity2_1_Child1).run(done);});
        it(('Get Success: board2 - child2'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.get({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child2._id}).then.expect.successStatus.and.containsEntity(entityFixtures.boardEntity2_1_Child2).run(done);});
    });

    /*************************************************************************************************************************************************************************/
    // Add
    /*************************************************************************************************************************************************************************/
    describe('add', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });

        let urlTemplate = '/boards/:boardId/priorities';

        it(('Invalid board id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: '00000'}).with.data(createRandomEntity(50, 20, 20, 20, 50)).then.expect.forbiddenError.run(done);});
        it(('Board that not belong to user'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity2_1._id}).with.data(createRandomEntity(10, 10, 20, 20, 50)).then.expect.forbiddenError.run(done);});
        it(('Board id not found'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: '570c8901133418b019c212c8'}).with.data(createRandomEntity(50, 20, 20, 20, 50)).then.expect.forbiddenError.run(done);});
        it(('NULL data'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(null).then.expect.invalidRequest.run(done);});
		it(('TITLE not filled'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(createRandomEntity(0, 20, 20, 20, 50)).then.expect.invalidData('title', messages.INVALID_TITLE).run(done);});

        it(('ICON FORECOLOR not filled'), (done) => {
            let dataToSend = createRandomEntity(50, 20, 0, 20, 50);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(dataToSend).then.expect.invalidData('foreColor', messages.INVALID_FORECOLOR, dataToSend.icon.foreColor).run(done);
        });
        it(('ICON BACKGROUNDCOLOR not filled'), (done) => {
            let dataToSend = createRandomEntity(50, 20, 20, 0, 50);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(dataToSend).then.expect.invalidData('backgroundColor', messages.INVALID_BACKGROUNDCOLOR, dataToSend.icon.backgroundColor).run(done);
        });
		it(('ICON NAME not filled'), (done) =>
        {
            let dataToSend = createRandomEntity(50, 20, 20, 20, 0);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(dataToSend).then.expect.invalidData('icon', messages.INVALID_ICON, dataToSend.icon.icon).run(done);
        });

		it(('TITLE has more than x chars'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(createRandomEntity(51, 20, 20, 20, 50)).then.expect.invalidData('title', messages.INVALID_TITLE).run(done);});
		it(('ICON FORECOLOR  has more than x chars'), (done) =>
        {
            let dataToSend = createRandomEntity(50, 20, 21, 20, 50);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(dataToSend).then.expect.invalidData('foreColor', messages.INVALID_FORECOLOR, dataToSend.icon.foreColor).run(done);
        });
        it(('ICON BACKGROUNDCOLOR  has more than x chars'), (done) =>
        {
            let dataToSend = createRandomEntity(50, 20, 20, 21, 50);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(dataToSend).then.expect.invalidData('backgroundColor', messages.INVALID_BACKGROUNDCOLOR, dataToSend.icon.backgroundColor).run(done);
        });
		it(('ICON NAME has more than x chars'), (done) =>
        {
            let dataToSend = createRandomEntity(50, 20, 20, 20, 51);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(dataToSend).then.expect.invalidData('icon', messages.INVALID_ICON, dataToSend.icon.icon).run(done);
        });

        it(('Valid data'), (done) => {
            let priorityToAdd = createRandomEntity(50, 20, 20, 20, 50);
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(priorityToAdd).then.expect.successAddStatus.and.bodyDataEquals(priorityToAdd).and.validate(existInDataBaseValidateFn).run(done);
        });

        it(('TITLE Already exists'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.post({boardId: entityFixtures.boardEntity1._id}).with.data(entityFixtures.boardEntity1_Child1).changeData({_id: null, nonce: null, color: 'alreadyExistTest'}).then.expect.invalidData('title', messages.INVALID_ALREADY_EXISTS).run(done);});
    });

    /*************************************************************************************************************************************************************************/
    // DELETE
    /*************************************************************************************************************************************************************************/
    describe('delete', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });

        let urlTemplate = '/boards/:boardId/priorities/:id';

        it(('Invalid board id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.delete({boardId: '00000', id: entityFixtures.boardEntity1_Child1._id}).then.expect.forbiddenError.run(done);});
		it(('Invalid entity id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.delete({boardId: entityFixtures.boardEntity1._id, id: '0000'}).then.expect.invalidRequest.run(done);});
		it(('Board that not belong to user'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.delete({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child1._id}).then.expect.forbiddenError.run(done);});
		it(('Board id not found'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.delete({boardId: '570c8901133418b019c212c8', id: entityFixtures.boardEntity2_1_Child1._id}).then.expect.forbiddenError.run(done);});
		it(('Entity not belong to board'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.delete({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_2_Child1._id}).then.expect.resourceNotFound.run(done);});
		it(('Delete Success: board1 - child1'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.delete({boardId: entityFixtures.boardEntity1._id, id: entityFixtures.boardEntity1_Child1._id}).then.expect.successDeleteStatus.and.validate(notExistInDataBaseValidateFn).run(done);});
		it(('Delete Success: board2 - child1'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.delete({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child1._id}).then.expect.successDeleteStatus.and.validate(notExistInDataBaseValidateFn).run(done);});
		it(('Delete Success: board2 - child2'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.delete({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child2._id}).then.expect.successDeleteStatus.and.validate(notExistInDataBaseValidateFn).run(done);});
    });


    /*************************************************************************************************************************************************************************/
    // UPDATE
    /*************************************************************************************************************************************************************************/
    describe('update', function ()
    {
        before(function (done) { createFixtures(done); });
        after(function (done) { dbUtils.clearDatabase(con, done); });

        let urlTemplate = '/boards/:boardId/priorities/:id';

        it(('Invalid board id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.put({boardId: '00000', id: entityFixtures.boardEntity1_Child1._id}).with.data(entityFixtures.boardEntity1_Child1).then.expect.forbiddenError.run(done);});
		it(('Invalid entity id'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.put({boardId: entityFixtures.boardEntity1._id, id: '0000'}).with.data(entityFixtures.boardEntity1_Child1).then.expect.invalidRequest.run(done);});
		it(('Board that not belong to user'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.put({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child1._id}).with.data(entityFixtures.boardEntity1_Child1).then.expect.forbiddenError.run(done);});
		it(('Board id not found'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.put({boardId: '570c8901133418b019c212c8', id: entityFixtures.boardEntity1_Child1._id}).with.data(entityFixtures.boardEntity1_Child1).then.expect.forbiddenError.run(done);});
		it(('Entity not belong to board'), (done) => { sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.put({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_2_Child1._id}).with.data(entityFixtures.boardEntity2_2_Child1).then.expect.resourceNotFound.run(done);});
		it(('Entity already Exists'), (done) =>
        {
            let updatedData = entityFixtures.boardEntity1_Child1.cloneFixture();
            updatedData.title = entityFixtures.boardEntity2_1_Child1.title;
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.put({boardId: entityFixtures.boardEntity1._id, id: entityFixtures.boardEntity1_Child1._id}).with.data(updatedData).then.expect.invalidData('title', messages.INVALID_ALREADY_EXISTS).run(done);
        });


		it(('Update Success: board1 - child1'), (done) =>
        {
            let updatedData = entityFixtures.boardEntity1_Child1.cloneFixture();
            updatedData.title = 'testeDeAlteracao';
            updatedData.icon.foreColor = 'testeDeAlteracaoCor';
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[1]).when.put({boardId: entityFixtures.boardEntity1._id, id: entityFixtures.boardEntity1_Child1._id}).with.data(updatedData).then.expect.successUpdateStatus.and.validate(isEntityUpdateInDb).run(done);
        });
		it(('Update Success: board2 - child1'), (done) =>
        {
            let updatedData = entityFixtures.boardEntity2_1_Child1.cloneFixture();
            updatedData.title = 'testeDeAlteracao222';
            updatedData.icon.foreColor = 'tDeAlteracaoCor222';
            sc.create(urlTemplate).given.isAuthenticated(userFixtures[2]).when.put({boardId: entityFixtures.boardEntity2_1._id, id: entityFixtures.boardEntity2_1_Child1._id}).with.data(updatedData).then.expect.successUpdateStatus.and.validate(isEntityUpdateInDb).run(done);
        });
    });

});
