'use strict';
const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');
const moment = require('moment');

const Schema = mongoose.Schema;

const feedBackSchema = new Schema({
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_FEEDBACK')], validate: validators.isLength({message: localeManager.__('INVALID_FEEDBACK')}, 1, 5000)},
    owner: {type: String, default: ''},
    createdDate: {type: Date, default: function() { return moment().toDate();}}
});

module.exports = mongoose.model('FeedBack', feedBackSchema);
