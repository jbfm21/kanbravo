/*
https://github.com/edwardhotchkiss/mongoose-paginate/blob/master/index.js
The MIT License (MIT)

Copyright (c) 2011-2015, Edward Hotchkiss & Nick Baugh

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

/**
 * @package mongoose-paginate
 * @param {Object} [query={}]
 * @param {Object} [options={}]
 * @param {Object|String} [options.select]
 * @param {Object|String} [options.sort]
 * @param {Array|Object|String} [options.populate]
 * @param {Boolean} [options.lean=false]
 * @param {Boolean} [options.leanWithId=true]
 * @param {Number} [options.offset=0] - Use offset or page to set skip position
 * @param {Number} [options.page=1]
 * @param {Number} [options.limit=10]
 * @param {Function} [callback]
 * @returns {Promise}
 */

function paginate(query, options, callback)
{
    query = query || {};
    options = Object.assign({}, paginate.options, options);
    let select = options.select;
    let sort = options.sort;
    let populate = options.populate;
    let lean = options.lean || false;
    let leanWithId = options.leanWithId ? options.leanWithId : true;
    let limit = options.limit ? options.limit : 10;
    let offset, page, promises, skip;
    if (options.offset)
    {
        offset = options.offset;
        skip = offset;
    }
    else if (options.page)
    {
        page = options.page;
        skip = (page - 1) * limit;
    }
    else
    {
        page = 1;
        offset = 0;
        skip = offset;
    }
    if (limit)
    {
        let docsQuery = this.find(query).select(select).sort(sort).skip(skip).limit(limit).lean(lean);
        if (populate)
        {
            [].concat(populate).forEach((item) => {docsQuery.populate(item);});
        }
        promises =
        {
            docs: docsQuery.exec(),
            count: this.count(query).exec()
        };
        if (lean && leanWithId)
        {
            promises.docs = promises.docs.then((docs) =>
            {
                docs.forEach((doc) => {doc.id = String(doc._id);});
                return docs;
            });
        }
    }
    promises = Object.keys(promises).map((x) => promises[x]);
    return Promise.all(promises).then((data) =>
    {
        let result = {
            docs: data.docs,
            total: data.count,
            limit: limit
        };
        if (offset)
        {
            result.offset = offset;
        }
        if (page)
        {
            result.page = page;
            result.pages = Math.ceil(data.count / limit) || 1;
        }
        if (typeof callback === 'function')
        {
            return callback(null, result);
        }
        let promise = new Promise();
        promise.resolve(result);
        return promise;
    });
}

/**
 * @param {Schema} schema
 */

module.exports = function(schema)
{
    schema.statics.paginate = paginate;
};

module.exports.paginate = paginate;
