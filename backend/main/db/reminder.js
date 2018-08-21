'use strict';
const schemaName = 'Reminder';
const mongoose = require('mongoose');
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const localeManager = require('../locales/localeManager');
const validators = require('./plugins/mongoose-validators');

let schema = new BaseCardInfoSchema(
{
    description: {type: String, trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_REMINDER_DESCRIPTION')}, 0, 1000)},
    date: {type: Date, require: [true, localeManager.__('INVALID_DATE')], validate: validators.isDate({message: localeManager.__('INVALID_DATE')})},
    completed: {type: Boolean, default: false}
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);

