'use strict';
const schemaName = 'Impediment';
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const localeManager = require('../locales/localeManager');
const customValidators = require('./customValidators');
const validators = require('./plugins/mongoose-validators');

function startDateValidator(value) {return customValidators.isDateBefore(value, this.endDate);}
function endDateValidator(value) {return customValidators.isDateAfter(value, this.startDate);}

let schema = new BaseCardInfoSchema(
{
    type: {type: ObjectId, ref: 'ImpedimentType'},
    reason: {type: String, trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_IMPEDIMENT_REASON')}, 0, 1000)},
    startDate: {type: Date, require: [true, localeManager.__('INVALID_DATE')], validate: [startDateValidator, localeManager.__('INVALID_DATE_INTERVAL')]},
    endDate: {type: Date, validate: [endDateValidator, localeManager.__('INVALID_DATE_INTERVAL')]}
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
