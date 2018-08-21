'use strict';
const schemaName = 'CustomFieldConfig';
const mongoose = require('mongoose');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const enums = require('../enums');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');

let showInCardVector = [];
showInCardVector.push(null);
for (const c of enums.showInCard.enumValues)
{
    showInCardVector.push(c.name);
}


let fieldTypeVector = [];
for (const c of enums.fieldType.enumValues)
{
    fieldTypeVector.push(c.name);
}

let schema = new BaseBoardConfigSchema({
    helpText: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_DESCRIPTION')}, 1, 10000)},
    fieldType: {type: String, enum: fieldTypeVector},
    order: {type: Number, default: 0},
    showInCard: {type: String, enum: showInCardVector}
}, {isPolicyRequired: false});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
