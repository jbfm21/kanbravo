'use strict';

const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const localeManager = require('../locales/localeManager');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');

let tagSchema = new Schema({
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 50)},
    board: {type: ObjectId, ref: 'Board', require: [true, localeManager.__('INVALID_BOARDID')]},
    wipLimit: {type: Number, default: 0, validate: validators.isInt({message: localeManager.__('INVALID_WIP_LIMIT'), min: 0, skipNull: true, skipEmpty: true})},
    type: {type: ObjectId, ref: 'TagCategory'}
});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(tagSchema);

module.exports = mongoose.model('Tag', tagSchema);
