'use strict';

var _ = require('lodash');
var async = require('async');
var mongoose = require ('mongoose');


exports.clearDatabase = function(con, done)
{
    con.db.dropDatabase(function(err)
    {
        if (err)
        {
            console.log(JSON.stringify(err));
        }
        
        var asyncFunctions = []

        //Loop through all the known schemas, and execute an ensureIndex to make sure we're clean
        _.each(con.base.modelSchemas, function(schema, key) 
        {
            asyncFunctions.push(function(cb)
            {
                mongoose.model(key, schema).ensureIndexes(function()
                {
                    return cb()
                })
            })
        })
        async.parallel(asyncFunctions, function(err) 
        {
            done();
        })        
    });
};


