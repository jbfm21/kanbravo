'use strict';

var async = require('async');

var userFixture = require('./user-fixture');

var FixturePrep = require('./mongoose-fixtures'); //https://github.com/jcteague/mongoose-fixtures
var factory = require('./auto-fixture'); //https://github.com/jcteague/autofixturejs
var fixtures = new FixturePrep();

let userFixtures = null;
var createUserFixture = function (done)
{
    let createFixtureCallback = (err, returnedFixtures) => { userFixtures = returnedFixtures; done(err);};
    userFixture.createUserFixtures(createFixtureCallback.bind(this));
};

exports.createBoardFixtures = function(nextTaskFromCaller)
{
     let endTask = (err) =>
     {
         return nextTaskFromCaller(err, userFixtures, fixtures);
     };
     let createBoardMemberFixtures = () =>
     {
        fixtures.create(
        [
            {name: 'boardMemberEntity0', model: 'BoardMember', val: {board: fixtures.boardEntity0._id, user: userFixtures[0]._id}},
            {name: 'boardMemberEntity1', model: 'BoardMember', val: {board: fixtures.boardEntity1._id, user: userFixtures[1]._id}},
            {name: 'boardMemberEntity2_1', model: 'BoardMember', val: {board: fixtures.boardEntity2_1._id, user: userFixtures[2]._id}},
            {name: 'boardMemberEntity2_2', model: 'BoardMember', val: {board: fixtures.boardEntity2_2._id, user: userFixtures[2]._id}},
            {name: 'boardMemberEntity3', model: 'BoardMember', val: {board: fixtures.boardEntity2_1._id, user: userFixtures[3]._id}}
        ], endTask);
     };
     let createBoardFixtures = (err, entity) =>  //eslint-disable-line no-unused-vars
     {
        if (err) { return nextTaskFromCaller(err); }
        fixtures.create(
        [
            {name: 'boardEntity0', model: 'Board', val: factory.create('Board')},
            {name: 'boardEntity1', model: 'Board', val: factory.create('Board')},
            {name: 'boardEntity2_1', model: 'Board', val: factory.create('Board')},
            {name: 'boardEntity2_2', model: 'Board', val: factory.create('Board')}
        ], createBoardMemberFixtures);
     };
     async.waterfall([createUserFixture.bind(this)], createBoardFixtures.bind(this));
};
