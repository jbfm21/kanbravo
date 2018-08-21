'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');

const ratingSchema = new Schema({
    id: {type: String, trim: true, require: [true, localeManager.__('INVALID_ID')]},
    ratingType: {type: ObjectId, ref: 'RatingType'},
    votes: {type: Number, default: 0, validate: validators.isInt({message: localeManager.__('INVALID_VOTE_VALUE'), min: 0})}
});

module.exports = ratingSchema;


