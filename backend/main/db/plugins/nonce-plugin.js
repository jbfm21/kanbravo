//this is used for protecting against concurrent edits: http://docs.mongodb.org/ecosystem/use-cases/metadata-and-asset-management/
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = function (schema, options)  //eslint-disable-line no-unused-vars
{
    schema.add({nonce: ObjectId});

    schema.pre('save', function(next)
    {
        if (!this.nonce)
        {
            this.nonce = new mongoose.Types.ObjectId();
        }
        next();
    });

    schema.pre('findOneAndUpdate', function(next)
    {
        var conditions = this._conditions;
        var update = this._update;
        const isToIgnoreNonceInFind = (((this.options) && this.options.ignoreNonce));
        if (isToIgnoreNonceInFind)
        {
            delete conditions.nonce;
        }
        else
        {
            conditions.nonce = update.nonce;
            update.nonce = new mongoose.Types.ObjectId();
        }
        next();
    });
};
