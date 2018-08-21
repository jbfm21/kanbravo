'use strict';
const schemaName = 'RatingType';
const mongoose = require('mongoose');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');

let schema = new BaseBoardConfigSchema({
    maxRating: {type: Number, validate: validators.isInt({message: localeManager.__('INVALID_MAX_RATING'), min: 0})}
});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
