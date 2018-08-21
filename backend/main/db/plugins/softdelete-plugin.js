/*
https://github.com/dsanel/mongoose-delete/blob/master/index.js
The MIT License (MIT)

Copyright (c) 2014 Sanel Deljkic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Model = mongoose.Model;

/**
 */
/* istanbul ignore next */
function parseUpdateArguments (conditions, doc, options, callback)
{
    if (typeof options === 'function')
    {
        callback = options;
        options = null;
    }
    else if (typeof doc === 'function')
    {
        callback = doc;
        doc = conditions;
        conditions = {};
        options = null;
    }
    else if (typeof conditions === 'function')
    {
        callback = conditions;
        conditions = undefined; //eslint-disable-line
        doc = undefined; //eslint-disable-line
        options = undefined; //eslint-disable-line
    }
    else if (typeof conditions === 'object' && !doc && !options && !callback)
    {
        doc = conditions;
        conditions = undefined; //eslint-disable-line
        options = undefined; //eslint-disable-line
        callback = undefined; //eslint-disable-line
    }

    var args = [];

    if (conditions) {args.push(conditions);}
    if (doc) {args.push(doc);}
    if (options) {args.push(options);}
    if (callback) {args.push(callback);}

    return args;
}

function parseIndexFields (options)
{
    var indexFields =
    {
        deleted: false,
        deletedAt: false,
        deletedBy: false
    };

    if (!options.indexFields)
    {
        return indexFields;
    }

    if ((typeof options.indexFields === 'string' || options.indexFields instanceof String) && options.indexFields === 'all')
    {
        indexFields.deleted = indexFields.deletedAt = indexFields.deletedBy = true;
    }

    if (typeof (options.indexFields) === 'boolean' && options.indexFields === true)
    {
        indexFields.deleted = indexFields.deletedAt = indexFields.deletedBy = true;
    }

    if (Array.isArray(options.indexFields))
    {
        indexFields.deleted = options.indexFields.indexOf('deleted') > -1;
        indexFields.deletedAt = options.indexFields.indexOf('deletedAt') > -1;
        indexFields.deletedBy = options.indexFields.indexOf('deletedBy') > -1;
    }

    return indexFields;
}

module.exports = function (schema, options)
{
    options = options || {};
    var indexFields = parseIndexFields(options);

    schema.add({
        deleted: {
            type: Boolean,
            default: false,
            index: indexFields.deleted
        }
    });

    if (options.deletedAt === true)
    {
        schema.add({deletedAt: {type: Date, index: indexFields.deletedAt}});
    }

    if (options.deletedBy === true)
    {
        schema.add({deletedBy: {type: Schema.Types.ObjectId, index: indexFields.deletedBy}});
    }

    schema.pre('save', function (next)
    {
        if (!this.deleted)
        {
            this.deleted = false;
        }
        next();
    });

    if (options.overrideMethods)
    {
        var overrideItems = options.overrideMethods;
        var overridableMethods = ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'];
        var finalList = [];

        if ((typeof overrideItems === 'string' || overrideItems instanceof String) && overrideItems === 'all')
        {
            finalList = overridableMethods;
        }

        if (typeof (overrideItems) === 'boolean' && overrideItems === true)
        {
            finalList = overridableMethods;
        }

        if (Array.isArray(overrideItems))
        {
            overrideItems.forEach(function(method)
            {
                if (overridableMethods.indexOf(method) > -1)
                {
                    finalList.push(method);
                }
            });
        }

        finalList.forEach(function(method)
        {
            if (method === 'count' || method === 'find' || method === 'findOne')
            {
                //<CUSTOM>
                if (method !== 'find')
                {
                    //Nao altera o comportamento original do metodo find por conta do populate()
                    //Nesse caso utilizar o metodo findWithoutDeleted
                    schema.statics[method] = function ()
                    {
                        return Model[method].apply(this, arguments).where('deleted').ne(true);
                    };
                }
                //</CUSTOM>
                schema.statics[method + 'Deleted'] = function ()
                {
                    return Model[method].apply(this, arguments).where('deleted').ne(false);
                };
                //<CUSTOM>
                schema.statics[method + 'WithoutDeleted'] = function ()
                {
                    return Model[method].apply(this, arguments).where('deleted').ne(true);
                };
                //</CUSTOM>
                schema.statics[method + 'WithDeleted'] = function ()
                {
                    return Model[method].apply(this, arguments);
                };
            }
            else
            {
                schema.statics[method] = function ()
                {
                    var args = parseUpdateArguments.apply(undefined, arguments); //eslint-disable-line

                    args[0].deleted = {$ne: true};

                    return Model[method].apply(this, args);
                };

                schema.statics[method + 'Deleted'] = function ()
                {
                    var args = parseUpdateArguments.apply(undefined, arguments); //eslint-disable-line

                    args[0].deleted = {$ne: false};

                    return Model[method].apply(this, args);
                };

                //<CUSTOM>
                schema.statics[method + 'WithoutDeleted'] = function ()
                {
                    var args = parseUpdateArguments.apply(undefined, arguments); //eslint-disable-line

                    args[0].deleted = {$ne: true};

                    return Model[method].apply(this, args);
                };
                //</CUSTOM>
                schema.statics[method + 'WithDeleted'] = function ()
                {
                    return Model[method].apply(this, arguments);
                };
            }
        });
    }

    schema.methods.delete = function (deletedBy, cb)
    {
        var callback = typeof deletedBy === 'function' ? deletedBy : cb,
            deletedBy = cb !== undefined ? deletedBy : null; //eslint-disable-line

        this.deleted = true;

        if (schema.path('deletedAt'))
        {
            this.deletedAt = new Date();
        }

        if (schema.path('deletedBy'))
        {
            this.deletedBy = deletedBy;
        }

        if (options.validateBeforeDelete === false)
        {
            return this.save({validateBeforeSave: false}, callback);
        }

        return this.save(callback);
    };

    schema.statics.delete = function(conditions, deletedBy, callback)
    {
        if (typeof deletedBy === 'function')
        {
            callback = deletedBy;
            conditions = conditions;
            deletedBy = null;
        }
        else if (typeof conditions === 'function')
        {
            callback = conditions;
            conditions = {};
            deletedBy = null;
        }

        var doc = {
            deleted: true
        };

        if (schema.path('deletedAt'))
        {
            doc.deletedAt = new Date();
        }

        if (schema.path('deletedBy'))
        {
            doc.deletedBy = deletedBy;
        }

        if (this.updateWithDeleted)
        {
            return this.updateWithDeleted(conditions, doc, {multi: true}, callback);
        }
        return this.update(conditions, doc, {multi: true}, callback);
    };

    schema.methods.restore = function (callback)
    {
        this.deleted = false;
        this.deletedAt = undefined; //eslint-disable-line
        this.deletedBy = undefined; //eslint-disable-line
        return this.save(callback);
    };

    schema.statics.restore = function(conditions, callback)
    {
        if (typeof conditions === 'function')
        {
            callback = conditions;
            conditions = {};
        }

        var doc = {
            deleted: false,
            deletedAt: undefined, //eslint-disable-line
            deletedBy: undefined //eslint-disable-line
        };

        if (this.updateWithDeleted)
        {
            return this.updateWithDeleted(conditions, doc, {multi: true}, callback);
        }
        return this.update(conditions, doc, {multi: true}, callback);
    };

    //<CUSTOM>
    schema.statics.restoreAndUpdate = function(conditions, doc, callback)
    {
        doc.deleted = false;
        doc.deletedAt = undefined, //eslint-disable-line
        doc.deletedBy = undefined //eslint-disable-line
        if (this.updateWithDeleted)
        {
            return this.updateWithDeleted(conditions, doc, {multi: true}, callback);
        }
        return this.update(conditions, doc, {multi: true}, callback);
    };
    //</CUSTOM>

};
