'use strict';
const schemaName = 'Timesheet';
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const localeManager = require('../locales/localeManager');
const customValidators = require('./customValidators');
const validators = require('./plugins/mongoose-validators');

function trackerStartDateValidator(value) {return customValidators.isDateBefore(value, this.trackerEndDate);}
function trackerEndDateValidator(value) {return customValidators.isDateAfter(value, this.trackerStartDate);}

let schema = new BaseCardInfoSchema(
{
    user: {type: ObjectId, ref: 'User'},
    startDate: {type: Date, require: [true, localeManager.__('INVALID_DATE')], validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},
    minutes: {type: Number},
    trackerStartDate: {type: Date, require: [true, localeManager.__('INVALID_DATE')], validate: [trackerStartDateValidator, localeManager.__('INVALID_TIMESHEET_TRACKER_DATE_INTERVAL')]},
    trackerEndDate: {type: Date, validate: [trackerEndDateValidator, localeManager.__('INVALID_TIMESHEET_TRACKER_DATE_INTERVAL')]},
    trackerMinutes: {type: Number, default: 1}
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema, {mongoose_delete: false});

module.exports = mongoose.model(schemaName, schema);
