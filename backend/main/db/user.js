'use strict';

const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const passportLocalMongoose = require('passport-local-mongoose');
const noncePlugin = require('./plugins/nonce-plugin');

const localeManager = require('../locales/localeManager');
const avatarSchema = require('./avatarSchema');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const workOnCardSchema = new Schema({
    id: {type: String, trim: true, require: [true, localeManager.__('INVALID_ID')]},
    board: {type: ObjectId, ref: 'Board'},
    card: {type: ObjectId, ref: 'Card'},
    startDateTime: {type: Date}
});

var User = new Schema({
    givenname: {type: String, default: '', trim: true, require: [true, localeManager.__('AUTH_INVALID_USERNAME')], validate: [validators.isLength({message: localeManager.__('AUTH_INVALID_GIVENNAME')}, 1, 100)]},
    surname: {type: String, default: '', trim: true, require: [true, localeManager.__('AUTH_INVALID_SURNAME')], validate: [validators.isLength({message: localeManager.__('AUTH_INVALID_SURNAME')}, 1, 100)]},
    nickname: {type: String, default: '', unique: true, require: [true, localeManager.__('AUTH_INVALID_NICKNAME')], trim: true, validate: [validators.isLength({message: localeManager.__('AUTH_INVALID_NICKNAME')}, 1, 10), validators.isAlphanumeric({message: localeManager.__('AUTH_INVALID_NICKNAME')})]},
    username: {type: String, default: '', unique: true, require: [true, localeManager.__('AUTH_INVALID_USERNAME')], trim: true, validate: [validators.isLength({message: localeManager.__('AUTH_INVALID_USERNAME')}, 1, 100), validators.isEmail({message: localeManager.__('AUTH_INVALID_USERNAME')})]},
    provider: {type: String, default: 'local'}, //TODO: colocar validacao
    avatar: avatarSchema,
    workOnCard: workOnCardSchema
});

User.set('toJSON', {getters: true, virtuals: true});
User.set('toObject', {getters: true, virtuals: true});

User.index({nickname: 1}, {unique: true});

User.plugin(passportLocalMongoose);
User.plugin(noncePlugin);

module.exports = mongoose.model('User', User);
