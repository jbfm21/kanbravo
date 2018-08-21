'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const schemaName = 'CardMovementHistory';
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const localeManager = require('../locales/localeManager');
const validators = require('./plugins/mongoose-validators');
const laneType = require('../enums/laneType');

let laneTypeVector = [];
laneTypeVector.push(null);
for (const c of laneType.enumValues)
{
    laneTypeVector.push(c.name);
}

const movementSchema = new Schema({
    lane: {type: ObjectId},
    path: {type: String},
    activity: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_LANE_ACTIVITY')}, 0, 5)},
    laneType: {type: String, enum: laneTypeVector},
    startDate: {type: Date, require: [true, localeManager.__('INVALID_DATE')], validate: validators.isDate({message: localeManager.__('INVALID_DATE')})}
});


let schema = new BaseCardInfoSchema(
{
    movements: [movementSchema]
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
