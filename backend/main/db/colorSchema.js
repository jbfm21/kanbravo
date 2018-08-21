'use strict';

const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const Schema = mongoose.Schema;
const localeManager = require('../locales/localeManager');

const colorSchema = new Schema({
    r: {type: Number, require: [true, localeManager.__('INVALID_COLOR')], validate: validators.isNumeric({message: localeManager.__('INVALID_COLOR')})},
    g: {type: Number, require: [true, localeManager.__('INVALID_COLOR')], validate: validators.isNumeric({message: localeManager.__('INVALID_COLOR')})},
    b: {type: Number, require: [true, localeManager.__('INVALID_COLOR')], validate: validators.isNumeric({message: localeManager.__('INVALID_COLOR')})},
    a: {type: Number, require: [true, localeManager.__('INVALID_COLOR')]}
});

module.exports = colorSchema;
