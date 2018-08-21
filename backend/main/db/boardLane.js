'use strict';

const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const Schema = mongoose.Schema;
const localeManager = require('../locales/localeManager');
const noncePlugin = require('./plugins/nonce-plugin');
const laneType = require('../enums/laneType');

let laneTypeVector = [];
laneTypeVector.push(null);
for (const c of laneType.enumValues)
{
    laneTypeVector.push(c.name);
}

const dateMetricConfigSchema = new Schema({
    isStartLeadTime: {type: Boolean, default: false},
    isEndLeadTime: {type: Boolean, default: false},
    isStartCycleTime: {type: Boolean, default: false},
    isEndCycleTime: {type: Boolean, default: false}
});

let boardLaneNodeSchema = new Schema({
    laneType: {type: String, enum: laneTypeVector},
    isCollapsed: {type: Boolean, default: false},
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 50)},
    policy: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_POLICY')}, 0, 1000)},
    activity: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_LANE_ACTIVITY')}, 0, 5)},
    cardsWide: {type: Number, default: 1, validate: validators.isInt({message: localeManager.__('INVALID_CARDS_WIDE'), min: 1})},
    orientation: {type: Number, default: 0}, //0 = Horizontal, 1 = vertical
    wipLimit: {type: Number, default: 0, validate: validators.isInt({message: localeManager.__('INVALID_WIP_LIMIT'), min: 0})},
    dateMetricConfig: {type: dateMetricConfigSchema, default: {isStartLeadTime: false, isEndLeadTime: false, isStartCycleTime: false, isEndCycleTime: false}},
    cards: [{type: mongoose.Schema.Types.ObjectId, ref: 'Card'}]
});

boardLaneNodeSchema.add({children: [boardLaneNodeSchema]});

let boardLaneSchema = new Schema({
    board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board'},
    rootNode: {type: boardLaneNodeSchema}
});

boardLaneSchema.plugin(noncePlugin);

module.exports = mongoose.model('BoardLane', boardLaneSchema);
