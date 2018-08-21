/*
Exemplo para extender o esquema
    'use strict';
    const schemaName = 'Priority';
    const mongoose = require('mongoose');
    const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
    let schema = new BaseBoardConfigSchema({department: String});
    BaseBoardConfigSchema.addDefaultsPluginsAndKeys(schema);
    module.exports = mongoose.model(schemaName, schema);
*/
'use strict';

const mongoose = require('mongoose');
const util = require('util');
const Schema = mongoose.Schema;
const _ = require('lodash');
const validators = require('./plugins/mongoose-validators');
const ObjectId = mongoose.Schema.Types.ObjectId;
const localeManager = require('../locales/localeManager');
const avatarSchema = require('./avatarSchema');
const noncePlugin = require('./plugins/nonce-plugin');
const mongoose_delete = require('./plugins/softdelete-plugin');

function BaseBoardConfigSchema(fields, options)
{
  let actualOptions = _.defaults(options || {},
  {
      isPolicyRequired: true
  });


  Schema.apply(this, arguments);

  this.add({
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 50)},
    policy: {type: String, default: '', trim: true, validate: validators.isLength({message: localeManager.__('INVALID_POLICY')}, (actualOptions.isPolicyRequired ? 1 : 0), 1000)},
    wipLimit: {type: Number, default: 0, validate: validators.isInt({message: localeManager.__('INVALID_WIP_LIMIT'), min: 0, skipNull: true, skipEmpty: true})},
    avatar: avatarSchema,
    board: {type: ObjectId, ref: 'Board', require: [true, localeManager.__('INVALID_BOARDID')]}
  });
}

function addDefaultsPluginsAndKeys(schema)
{
    schema.index({board: 1, _id: 1}, {unique: true});
    //Atualmente com o indice abaixo é permitido excluir e incluir um item com mesmo titulo, o removido fica como exclusao logica...Seria interessante, recuperar o elemento excluido ao inves de incluir um novo?
    schema.index({board: 1, title: 1}, {unique: false});
    schema.plugin(noncePlugin);
    schema.plugin(mongoose_delete, {overrideMethods: ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'], validateBeforeDelete: false});
}

util.inherits(BaseBoardConfigSchema, Schema);

module.exports = BaseBoardConfigSchema;
module.exports.model = mongoose.model('BaseBoardConfigSchema', new BaseBoardConfigSchema()); //Caso queria utilizar com discriminator (http://mongoosejs.com/docs/api.html#model_Model.discriminator)
module.exports.addDefaultsPluginsAndKeys = addDefaultsPluginsAndKeys;
