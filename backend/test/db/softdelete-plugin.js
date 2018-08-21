'use strict';

var should = require('should');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoose_delete = require('../../main/db/plugins/softdelete-plugin');

var describe = require('mocha').describe;
var it = require('mocha').it;
var before = require('mocha').before;
var after = require('mocha').after;

var config = require('konfig')({path: __dirname.replace('test\\db', 'main') + '/config'}).app;


mongoose.connect(config.db.mongodb, function() {});

var con = mongoose.createConnection(config.db.mongodb);


describe('mongoose_delete plugin without options', function ()
{
    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test1'});
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1', Test1Schema);

    before(function (done)
    {
        var puffy = new Test1({name: 'Puffy'});
        puffy.save(function () { done(); });
    });

    after(function (done)
    {
        con.db.dropCollection('mongoose_delete_test1', function () { done(); });
    });

    it('delete() -> should set deleted:true', function (done)
    {
        Test1.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);

            puffy.delete(function (err2, success)
            {
                if (err2) { throw err2; }
                success.deleted.should.equal(true);
                done();
            });
        });
    });

    it('delete() -> should not save "deletedAt" value', function (done)
    {
        Test1.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);

            puffy.delete(function (err2, success)
            {
                if (err2) { throw err2; }
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });

    it('restore() -> should set deleted:false', function (done)
    {
        Test1.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);

            puffy.restore(function (err2, success)
            {
                if (err2) { throw err2; }
                success.deleted.should.equal(false);
                done();
            });
        });
    });
});

describe('mongoose_delete with options: { deletedAt : true }', function ()
{
    var Test2Schema = new Schema({name: String}, {collection: 'mongoose_delete_test2'});
    Test2Schema.plugin(mongoose_delete, {deletedAt: true});
    var Test2 = mongoose.model('Test2', Test2Schema);

    before(function (done)
    {
        var puffy = new Test2({name: 'Puffy'});

        puffy.save(function () { done(); });
    });

    after(function (done)
    {
        con.db.dropCollection('mongoose_delete_test2', function () { done(); });
    });

    it('delete() -> should save "deletedAt" key', function (done)
    {
        Test2.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);
            puffy.delete(function (err2, success)
            {
                if (err2) { throw err2; }
                should.exist(success.deletedAt);
                done();
            });
        });
    });

    it('restore() -> should set deleted:false and delete deletedAt key', function (done)
    {
        Test2.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);

            puffy.restore(function (err2, success) {
                if (err2) { throw err2; }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });
});

describe('mongoose_delete with options: { deletedBy : true }', function ()
{

    var Test3Schema = new Schema({name: String}, {collection: 'mongoose_delete_test3'});
    Test3Schema.plugin(mongoose_delete, {deletedBy: true});
    var Test3 = mongoose.model('Test3', Test3Schema);

    before(function (done)
    {
        var puffy = new Test3({name: 'Puffy'});

        puffy.save(function () { done(); });
    });

    after(function (done)
    {
        con.db.dropCollection('mongoose_delete_test3', function () { done(); });
    });

    var id = mongoose.Types.ObjectId('53da93b16b4a6670076b16bf');

    it('delete() -> should save deletedBy key', function (done)
    {
        Test3.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);

            puffy.delete(id, function (err2, success)
            {
                if (err2) { throw err2; }
                success.deletedBy.should.equal(id);
                done();
            });
        });
    });

    it('restore() -> should set deleted:false and delete deletedBy key', function (done)
    {
        Test3.findOne({name: 'Puffy'}, function (err, puffy)
        {
            should.not.exist(err);
            puffy.restore(function (err2, success)
            {
                if (err2) { throw err2; }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedBy);
                done();
            });
        });
    });
});

