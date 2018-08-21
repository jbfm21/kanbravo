'use strict';
const schemaName = 'Comment';
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const localeManager = require('../locales/localeManager');

let schema = new BaseCardInfoSchema(
{
    author: {type: ObjectId, ref: 'User'},
    text: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_COMMENT')]},
    createdDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now}
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema, {mongoose_delete: false});
module.exports = mongoose.model(schemaName, schema);
