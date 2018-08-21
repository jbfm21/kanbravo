'use strict';
const schemaName = 'Project';
const mongoose = require('mongoose');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');
const PHASE = 'initiation planning execution close'.split(' ');

let schema = new BaseBoardConfigSchema({
    description: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_DESCRIPTION')}, 1, 1000)},
    phase: {type: String, enum: PHASE}
}, {isPolicyRequired: false});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
