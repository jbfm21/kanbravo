'use strict';

const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const localeManager = require('../locales/localeManager');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');

const boardVisualStyleSchema = new Schema({
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 50)},
    isToShowLaneHeaderActivity: {type: Boolean, default: true},
    isToShowLaneHeaderLaneType: {type: Boolean, default: true},
    isToShowLaneHeaderPolicy: {type: Boolean, default: true},
    board: {type: ObjectId, ref: 'Board', require: [true, localeManager.__('INVALID_BOARDID')]}
});

BaseBoardConfigSchema.addDefaultsPluginsAndKeys(boardVisualStyleSchema);

module.exports = mongoose.model('boardVisualStyle', boardVisualStyleSchema);
