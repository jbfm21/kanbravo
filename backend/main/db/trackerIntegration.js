'use strict';
const schemaName = 'TrackerIntegration';
const mongoose = require('mongoose');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');
const INTEGRATION_TYPE = 'generic clearquest'.split(' ');


let schema = new BaseBoardConfigSchema(
{
    integrationType: {type: String, enum: INTEGRATION_TYPE},
    queryUrl: {type: String, default: '', trim: true, validate: validators.isLength({message: localeManager.__('INVALID_URL')}, 1, 255)},
    apiHeader: {type: String, default: '', trim: true, validate: validators.isLength({message: localeManager.__('INVALID_TRACKER_INTEGRATION_API_HEADER')}, 0, 255)},
    apiKey: {type: String, default: '', trim: true, validate: validators.isLength({message: localeManager.__('INVALID_TRACKER_INTEGRATION_API_KEY')}, 0, 255)},
    isActive: {type: Boolean, default: false}
}, {isPolicyRequired: false});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
