'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');
const boardMemberPreferenceSchema = require('./boardMemberPreferenceSchema');
const mongoose_delete = require('./plugins/softdelete-plugin');
const role = require('../enums/role');

let rolesVector = [];
for (const c of role.enumValues)
{
    rolesVector.push(c.name);
}

let boardMemberSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: [true, localeManager.__('INVALID_MEMBER_USER')]},
    board: {type: mongoose.Schema.Types.ObjectId, ref: 'Board'},
    role: {type: String, enum: rolesVector, require: [true, localeManager.__('INVALID_ROLE')]},
    hourPerDay: {type: Number, default: 8},
    wipLimit: {type: Number, default: 0, validate: validators.isInt({message: localeManager.__('INVALID_WIP_LIMIT'), min: 0})},
    boardPreference: boardMemberPreferenceSchema
});

boardMemberSchema.index({board: 1, user: 1}, {unique: true});
boardMemberSchema.plugin(mongoose_delete, {overrideMethods: ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'], validateBeforeDelete: false});

module.exports = mongoose.model('BoardMember', boardMemberSchema);

