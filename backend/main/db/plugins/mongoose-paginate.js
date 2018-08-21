/*
https://github.com/jonlil/mongoose-paginate

The MIT License (MIT)
Copyright (c) 2015 Jonas Liljestrand
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const mongoose = require('mongoose');
/**
 *
 * @param sort
 * @returns {*}
 */
var normalizeSorting = function(sort)
{
    if (!sort) {return false;}
    if (sort.toString().toLowerCase() === 'asc') {return 1;}
    if (sort.toString().toLowerCase() === 'desc') {return -1;}
    return sort;
};

var paginatePlugin = function (schema, options)
{
    options = options || {};
    options.limit = options.limit || 25;
    options.direction = options.direction || 1;
    options.defaultKey = options.defaultKey || '_id';

    mongoose.Query.prototype.execPagination = function(callback)
    {
        var query = this;
        var _return = {};

        if (!query.options.paginateKey)
        {
            throw new Error('Did you forget to use pagination plugin?');
        }
        if (!query.options.limit)
        {
            query.options.limit = options.limit;
        }

        query.exec(function(err, objects)
        {
            if (!objects)
            {
                objects = [];
            }
            if (query.options.flip)
            {
                objects.reverse();
            }

            _return.results = objects;
            _return.perPage = query.options.limit;
            _return.thisPage = objects.length;

            var order = query.options.sort[query.options.paginateKey];
            var after, before;

            // if sorting is flipped, get initial sorting direction
            if (query.options.flip)
            {
                order = order > 0 ? -1 : 1;
            }

            // cases
            if (order === -1)
            {
              after = 0;
              before = objects.length - 1;
            }
            else
            {
              after = objects.length - 1;
              before = 0;
            }

            _return.after = objects.length > 0 ? objects[after][query.options.paginateKey] : null;
            _return.before = objects.length > 0 ? objects[before][query.options.paginateKey] : null;

            return callback(err, _return);
        });
    };

    schema.statics['paginate'] = function(params, key, cb) //eslint-disable-line
    {
        var q = this.find();
        params = params || {};
        var sorting = {};
        var query = {};
        var sortKey;

        q.options.flip = false;

        if (typeof params === 'function')
        {
            cb = params;
            params = {};
        }
        if (typeof params === 'string')
        {
            key = params;
            params = {};
        }

        if (!key)
        {
            key = options.defaultKey;
        }
        sortKey = key;
        if (params.after && params.before)
        {
            throw new Error('Pagination can\'t have both after and before parameter');
        }

        if (key === 'id')
        {
            sortKey = '_id';
        }

        sorting[sortKey] = normalizeSorting(params.sort) || options.direction;

        if (params.after || params.before)
        {
            query[key] = {};

            if (params.after)
            {
                q.options.method = 'after';
                if (sorting[sortKey] > 0)
                {
                    query[key] = {$gt: params.after};
                }
                else
                {
                    query[key] = {$gt: params.after};
                    sorting[sortKey] = 1;
                    q.options.flip = true;
                }
            }
            else if (params.before)
            {
                q.options.method = 'before';
                if (sorting[sortKey] > 0)
                {
                    query[key] = {$lt: params.before};
                    sorting[sortKey] = -1;
                    q.options.flip = true;
                }
                else
                {
                    query[key] = {$lt: params.before};
                }
            }
        }

        q.where(query);
        q.sort(sorting);
        q.limit(options.limit);
        q.options.paginateKey = key;


        if (typeof cb === 'function')
        {
            q.exec(function(err, results)
            {
                if (err)
                {
                    return cb(err);
                }
                return cb(err, q.options.flip ? results.reverse() : results);
            });
        }

        return q;
    };
};

module.exports.normalizeSorting = normalizeSorting;
module.exports.plugin = paginatePlugin;
