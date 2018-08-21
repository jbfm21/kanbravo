'use strict';
const schemaName = 'CardIdConfig';
const mongoose = require('mongoose');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');

let schema = new BaseBoardConfigSchema(
{
    prefix: {type: String, default: '', trim: true},
    urlTemplate: {type: String, default: '', trim: true, validate: validators.isLength({message: localeManager.__('INVALID_URL_TEMPLATEA')}, 1, 255)},
    paddingSize: {type: Number, default: 0, validate: validators.isInt({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_PADDING_SIZE'), min: 0, max: 50})},
    paddingChar: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_PADDING_CHAR')}, 1, 1)}
}, {isPolicyRequired: false});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
