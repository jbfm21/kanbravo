'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');

const attachmentSchema = new Schema({
    id: {type: String, trim: true, require: [true, localeManager.__('INVALID_ID')]},
    name: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_FILENAME')], validate: validators.isLength({message: localeManager.__('INVALID_FILENAME')}, 1, 255)},
    lastModifiedDate: {type: Date},
    size: {type: Number},
    type: {type: String, trim: true},
    path: {type: String, trim: true}
});

module.exports = attachmentSchema;
