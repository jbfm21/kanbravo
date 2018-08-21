'use strict';

const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const localeManager = require('../locales/localeManager');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const avatarSchema = require('./avatarSchema');

let agingSchema = new Schema({
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 50)},
    board: {type: ObjectId, ref: 'Board', require: [true, localeManager.__('INVALID_BOARDID')]},
    avatar: avatarSchema,
    numberOfDays: {type: Number, default: 0, validate: validators.isInt({message: localeManager.__('INVALID_NUMBER_OF_DAYS'), min: 0})}
});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(agingSchema);

module.exports = mongoose.model('Aging', agingSchema);
