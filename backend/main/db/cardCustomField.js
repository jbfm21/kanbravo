'use strict';
const schemaName = 'CardCustomField';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const BaseCardInfoSchema = require('./BaseCardInfoSchema');

const fieldSchema = new Schema({
    value: {type: String},
    nonce: ObjectId,
    type: {type: ObjectId, ref: 'CustomFieldConfig'}
}, {_id: false});

let schema = new BaseCardInfoSchema(
{
    fields: [fieldSchema]
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
