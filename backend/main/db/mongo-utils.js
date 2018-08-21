'use strict';
class MongoUtils
{
    static isEntityAlreadyExists(err)
    {
        return (err.name === 'MongoError') && (err.message.toLowerCase().indexOf('duplicate key error') >= 0);
    }
}

module.exports = MongoUtils;
