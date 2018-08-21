'use strict';

var userDb = require('../../main/db/user');
var async = require('async');

exports.createUserFixtures = function(nextTaskFromCaller)
{
     let userFixtures = [
        {givenname: 'usu0', surname: 'u0', nickname: 'u0', username: 'usu0@u.com', password: '123456'},
        {givenname: 'usu1', surname: 'u1', nickname: 'u1', username: 'usu1@u.com', password: '123456'},
        {givenname: 'usu2', surname: 'u2', nickname: 'u2', username: 'usu2@u.com', password: '123456'},
        {givenname: 'usu3', surname: 'u3', nickname: 'u3', username: 'usu3@u.com', password: '123456'},
        {givenname: 'usu4', surname: 'u4', nickname: 'u4', username: 'usu4@u.com', password: '123456'}        
     ];
     async.waterfall([
        function(nextTask)
        {
            return userDb.register(userFixtures[0], userFixtures[0].password, nextTask);
        },
        function(entity, nextTask)
        {
            userFixtures[0]._id = entity._id;
            return userDb.register(userFixtures[1], userFixtures[1].password, nextTask);
        },
        function(entity, nextTask)
        {
           userFixtures[1]._id = entity._id;
           return userDb.register(userFixtures[2], userFixtures[2].password, nextTask);
        },
        function(entity, nextTask)
        {
           userFixtures[2]._id = entity._id;
           return userDb.register(userFixtures[3], userFixtures[3].password, nextTask);
        },
        function(entity, nextTask)
        {
           userFixtures[3]._id = entity._id;
           return userDb.register(userFixtures[4], userFixtures[4].password, nextTask);
        }        
    ], function(err, entity)
    {
        if (err) { return nextTaskFromCaller(err); }
        userFixtures[4]._id = entity._id;
        return nextTaskFromCaller(err, userFixtures);
    });
};
