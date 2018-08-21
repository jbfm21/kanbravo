/// <reference path="../../../typings/async/async.d.ts""/>
'use strict';

var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');

class FixturePrep
{
    constructor()
    {
        this.models_created = [];
    }

    create(items, done)
    {
        let callback = () => done();
        async.eachSeries(items, this._createItem.bind(this), callback);
    }

    _cloneFixture(newProps)
    {
        let clone = JSON.parse(JSON.stringify(this));
        if (newProps)
        {
            for (let propName in newProps)
            {
                clone[propName] = newProps[propName];
            }        
        }
        return clone;
    }
    
    cleanUp(done)
    {
        let cleanupCallback = (model, callback) =>
        {
            if (model)
            {
                model.collection.drop((err) => callback(err));
            }
        };
        async.each(_.uniq(this.models_created), cleanupCallback, done);
    }

    _createItem(item, callback)
    {
        if (item.val instanceof Array)
        {
            this._createArray(item, callback);
            return;
        }
        let Model = mongoose.model(item.model);
        this.models_created.push(Model);
        let val = _.isFunction(item.val) ? item.val(this) : item.val;
        let m = new Model(val);
        m.cloneFixture = this._cloneFixture;
        let itemSavedFn = (err, result) =>
        {
            if (err)
            {
                console.log(err);
                return callback();
            }
            this[item.name] = m;
            return callback();
        };
        m.save(itemSavedFn.bind(this));
    }

    _createArray(item, done)
    {
        var Model = mongoose.model(item.model);
        var that = this;
        that.models_created.push(Model);
        var items = [];
        async.eachSeries(item.val, function (val, callback)
        {
            var model = new Model(val);
            model.save(function itemSaved(err, result)
            {
                if (err)
                {
                    console.log(err);
                    return callback();
                }
                result.cloneFixture = this._cloneFixture;
                items.push(result);
                return callback();
            });
        }, function ()
        {
            that[item.name] = items;
            done();
        });
    }

}

module.exports = FixturePrep;
