'use strict';

const mongoose = require('mongoose');
const colorSchema = require('./colorSchema');
const Schema = mongoose.Schema;

const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');

const avatarSchema = new Schema({
    foreColor: colorSchema,
    backgroundColor: colorSchema,
    borderColor: colorSchema,
    borderWidth: {type: Number},
    borderRadius: {type: Number},
    letter: {type: String, trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_AVATAR_LETTER'), min: 0, max: 2})},
    icon: {type: String, trim: true},
    imageSrc: {type: String, trim: true}
});

module.exports = avatarSchema;
