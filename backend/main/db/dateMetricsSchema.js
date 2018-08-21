'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');
const moment = require('moment');

const dateMetricsSchema = new Schema({

    //TODO: outras metricas: Work in Progress (WIP): Simply a number of work items that are currently in progress in the whole process. As a stand alone measure it doesn't make that much sense but it gives a lot of insight when combined with other measures. One classic example is Little's Law which adaptation to this context goes like this: Average Cycle Time = WIP / Average Throughput
    //TODO: Tact Time / Takt Time: A measure that says about frequency of delivering new work items. Tact time is Average Cycle Time divided by Average WIP. In other words it tells about throughput of a team and allows to assess whether remaining work would be done before a specific deadlin

    createdDate: {type: Date, default: function() { return moment().toDate();}, validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},
    startLeadTimeDate: {type: Date, default: null, validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},
    endLeadTimeDate: {type: Date, default: null, validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},
    startCycleTimeDate: {type: Date, default: null, validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},
    endCycleTimeDate: {type: Date, default: null, validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},
    lastLaneTransactionDate: {type: Date, default: null, validate: validators.isDate({message: localeManager.__('INVALID_DATE'), skipNull: true, skipEmpty: true})},

    customerLeadTime: {type: Number, default: null}, //endLadeTime - createdDate
    leadTime: {type: Number, default: null}, //endLadeTime - startLeadTime
    cycleTime: {type: Number, default: null}, //endCycleTimeDate - startCycleTimeDate
    backlogTime: {type: Number, default: null}, //leadTime-createdTime
    commitmentTime: {type: Number, default: null}, //cycleTime-leadTime
    deliveryTime: {type: Number, default: null}, //leadTime-cycleTime

    comments: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_METRIC_COMMENTS')}, 0, 3000)}
});

module.exports = dateMetricsSchema;
