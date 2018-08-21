'use strict';

const mongoose = require('mongoose');
const util = require('util');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const _ = require('lodash');
const localeManager = require('../locales/localeManager');
const noncePlugin = require('./plugins/nonce-plugin');
const mongoose_delete = require('./plugins/softdelete-plugin');
const paginator = require('./plugins/mongoose-paginate').plugin;

function BaseCardInfoSchema()
{
  Schema.apply(this, arguments);

  this.add({
    board: {type: ObjectId, ref: 'Board', require: [true, localeManager.__('INVALID_BOARDID')]},
    card: {type: ObjectId, ref: 'Card', require: [true, localeManager.__('INVALID_ID')]}
  });
}

function addDefaultsPluginsAndKeys(schema, options)
{
    let actualOptions = _.defaults(options || {},
    {
          noncePlugin: true,
          mongoose_delete: true,
          paginator: true
    });
    schema.index({board: 1, card: 1, _id: 1, cardStatus: 1}, {unique: true});
    if (actualOptions.noncePlugin) {schema.plugin(noncePlugin);}
    if (actualOptions.mongoose_delete) {schema.plugin(mongoose_delete, {overrideMethods: ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'], validateBeforeDelete: false});}
    if (actualOptions.paginator) {schema.plugin(paginator, {limit: 50, defaultKey: '_id', direction: -1});}
}

util.inherits(BaseCardInfoSchema, Schema);

module.exports = BaseCardInfoSchema;
module.exports.model = mongoose.model('BaseCardInfoSchema', new BaseCardInfoSchema()); //Caso queria utilizar com discriminator (http://mongoosejs.com/docs/api.html#model_Model.discriminator)
module.exports.addDefaultsPluginsAndKeys = addDefaultsPluginsAndKeys;
