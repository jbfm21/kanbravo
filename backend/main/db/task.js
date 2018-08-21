'use strict';
const schemaName = 'Task';
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const localeManager = require('../locales/localeManager');
const validators = require('./plugins/mongoose-validators');

let schema = new BaseCardInfoSchema(
{
    cardStatus: {type: String, default: 'inboard', enum: ['backlog', 'inboard', 'archived', 'canceled', 'deleted']}, //Parametro incluido para otimizar a query que gera estatistica de tarefas somente para tarefas dentro do quadro (exibida nos cartoes) //todo: colcoar em um enum esta repetido em card
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TASK_TITLE')}, 1, 1000)},
    type: {type: ObjectId, ref: 'TaskType'},
    completed: {type: Boolean, default: false}
});

BaseCardInfoSchema.addDefaultsPluginsAndKeys(schema);

module.exports = mongoose.model(schemaName, schema);
