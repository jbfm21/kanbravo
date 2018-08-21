'use strict';
//TODO: colocar nonce plugin? Ver quais são os impactos
const mongoose = require('mongoose');
const validators = require('./plugins/mongoose-validators');
const localeManager = require('../locales/localeManager');
const avatarSchema = require('./avatarSchema');
const mongoose_delete = require('./plugins/softdelete-plugin');
const boardVisibility = require('../enums/boardVisibility');

let visibilitiesVector = [];
visibilitiesVector.push(null);
for (const c of boardVisibility.enumValues)
{
    visibilitiesVector.push(c.name);
}

const Schema = mongoose.Schema;

const TEMPLATE_TYPE = 'empty software portfolio cycle'.split(' ');

var boardSchema = new Schema({
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 50)},
    subtitle: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_SUBTITLE')}, 0, 50)},
    description: {type: String, default: '', trim: true, validate: validators.isLength({skipNull: true, skipEmpty: true, message: localeManager.__('INVALID_DESCRIPTION')}, 0, 500)},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    avatar: avatarSchema,
    visibility: {type: String, default: 'internal', enum: visibilitiesVector},
    boardTemplate: {type: String, enum: TEMPLATE_TYPE}
});

boardSchema.plugin(mongoose_delete, {overrideMethods: ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'], validateBeforeDelete: false});

module.exports = mongoose.model('Board', boardSchema);

