'use strict';
const schemaName = 'ItemSize';
const mongoose = require('mongoose');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');

let schema = new BaseBoardConfigSchema();

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);