'use strict';

const mongoose = require('mongoose');
const moment = require('moment');
const validators = require('./plugins/mongoose-validators');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const noncePlugin = require('./plugins/nonce-plugin');
const localeManager = require('../locales/localeManager');
const customValidators = require('./customValidators');
const ratingSchema = require('./ratingSchema');
const attachmentSchema = require('./attachmentSchema');
const dateMetricsSchema = require('./dateMetricsSchema');
const paginator = require('./plugins/mongoose-paginate').plugin;

const fieldsToProject = {
    aging: '_id title avatar',
    classOfService: '_id title avatar',
    itemType: '_id title avatar',
    itemSize: '_id title avatar',
    metric: '_id title avatar',
    impedimentType: '_id title avatar',
    priority: '_id title avatar',
    project: '_id title avatar',
    cardIdConfig: '_id title avatar prefix urlTemplate paddingSize paddingChar',
    tag: '_id title avatar type',
    tagCategory: '_id title avatar',
    ratingType: '_id title avatar',
    trackerIntegration: '_id title avatar integrationType',
    assignedMembers: '_id deleted wipLimit user'
};

const fieldsToPopulate = [
    {path: 'classOfService', select: fieldsToProject.classOfService},
    {path: 'itemType', select: fieldsToProject.itemType},
    {path: 'itemSize', select: fieldsToProject.itemSize},
    {path: 'metric', select: fieldsToProject.metric},
    {path: 'impediments', select: '_id board nonce card type startDate endDate', populate: {path: 'type', model: 'ImpedimentType', select: fieldsToProject.impedimentType}},
    {path: 'priority', select: fieldsToProject.priority},
    {path: 'project', select: fieldsToProject.project},
    {path: 'parent', select: '_id title board', populate: {path: 'board', model: 'Board', select: '_id title'}},
    {path: 'cardIdConfig', select: fieldsToProject.cardIdConfig},
    {path: 'tags', select: fieldsToProject.tags},
    {path: 'assignedMembers', select: fieldsToProject.assignedMembers, populate: {path: 'user', model: 'User', select: '_id nonce givenname surname nickname avatar workOnCard'}},
    {path: 'ratings', select: 'id votes', populate: {path: 'ratingType', model: 'RatingType', select: '_id title avatar maxRating'}},
    {path: 'childrenMetric', select: '_id title avatar'}
];

const archiveFieldsToPopulate = [
    {path: 'classOfService', select: '_id title avatar'},
    {path: 'itemType', select: '_id title avatar'},
    {path: 'itemSize', select: '_id title avatar'},
    {path: 'metric', select: '_id title avatar'},
    {path: 'priority', select: '_id title avatar'},
    {path: 'project', select: '_id title avatar'},
    {path: 'parent', select: '_id title board', populate: {path: 'board', model: 'Board', select: '_id title'}}
];

function startPlanningDateValidator(value) {return customValidators.isDateBefore(value, this.endPlanningDate);}
function endPlanningDateValidator(value) {return customValidators.isDateAfter(value, this.startPlanningDate);}
function startExecutionDateValidator(value) {return customValidators.isDateBefore(value, this.endExecutionDate);}
function endExecutionDateValidator(value) {return customValidators.isDateAfter(value, this.startExecutionDate);}

const mutualFields = {
    title: {type: String, default: '', trim: true, require: [true, localeManager.__('INVALID_TITLE')], validate: validators.isLength({message: localeManager.__('INVALID_TITLE')}, 1, 100)},
    board: {type: ObjectId, ref: 'Board', require: [true, localeManager.__('INVALID_BOARDID')]},
    description: {type: String},
    parent: {type: ObjectId, ref: 'Card', require: [false, localeManager.__('INVALID_ID')]},
    classOfService: {type: ObjectId, ref: 'ClassOfService'},
    itemType: {type: ObjectId, ref: 'ItemType'},
    itemSize: {type: ObjectId, ref: 'ItemSize'},
    cardIdConfig: {type: ObjectId, ref: 'CardIdConfig'},
    priority: {type: ObjectId, ref: 'Priority'},
    priorityNumberValue: {type: Number, require: false, validate: validators.isInt({message: localeManager.__('INVALID_PRIORITY_NUMBER_VALUE'), skipNull: true, skipEmpty: true})},
    project: {type: ObjectId, ref: 'Project'},
    tags: [{type: ObjectId, ref: 'Tag'}],
    ratings: [ratingSchema],
	assignedMembers: [{type: ObjectId, ref: 'BoardMember'}],
    metricValue: {type: Number, require: false, validate: validators.isInt({message: localeManager.__('INVALID_METRIC_VALUE'), skipNull: true, skipEmpty: true, min: 0})},
    metric: {type: ObjectId, ref: 'Metric'},
    externalId: {type: String},
    externalLink: {type: String},
    startPlanningDate: {type: Date, validate: [startPlanningDateValidator, localeManager.__('INVALID_PLANNING_DATE_INTERVAL')]},
    endPlanningDate: {type: Date, validate: [endPlanningDateValidator, localeManager.__('INVALID_PLANNING_DATE_INTERVAL')]}
};

let cardSchema = new Schema({
    status: {type: String, enum: ['backlog', 'inboard', 'archived', 'canceled', 'deleted']}, //todo: colcoar em um enum esta repetido em card, task, impediment e reminder
    attachments: [attachmentSchema],
    impediments: [{type: ObjectId, ref: 'Impediment'}], //TODO: retirar daqui essa associacao, mas ver que a interface KCard a utiliza para exibir se o cartao está impedido ou não! QUal melhor forma de tratar isso, ao tirar isso, pode ser removido o posADd e posDelete da api de impedimento de que preenche esse vetor
    startExecutionDate: {type: Date, validate: [startExecutionDateValidator, localeManager.__('INVALID_EXECUTION_DATE_INTERVAL')]},
    endExecutionDate: {type: Date, validate: [endExecutionDateValidator, localeManager.__('INVALID_EXECUTION_DATE_INTERVAL')]},
    canceledDate: {type: Date, default: null},
    archivedDate: {type: Date, default: null},
    numComments: {type: Number, default: 0},
    creator: {type: ObjectId, ref: 'User'},
    dateMetrics: {type: dateMetricsSchema, default: function() { return {createdDate: moment().toDate()};}},
    childrenMetric: {type: ObjectId, ref: 'Metric'},
    childrenMetricValue: {type: Number, require: false, validate: validators.isInt({message: localeManager.__('INVALID_METRIC_VALUE'), skipNull: true, skipEmpty: true, min: 0})},
    grandChildrenCardsBasedCalculation: {type: Boolean}
});

cardSchema.add(mutualFields);

let templateCardSchema = new Schema(mutualFields);

cardSchema.index({board: 1, _id: 1, status: 1}, {unique: true});
cardSchema.index({parent: 1});
cardSchema.index({board: 1, parent: 1});
cardSchema.index({board: 1, parent: 1, project: 1, title: 1});
cardSchema.plugin(noncePlugin);
cardSchema.plugin(paginator);

templateCardSchema.index({board: 1, _id: 1}, {unique: true});
templateCardSchema.plugin(noncePlugin);

module.exports = mongoose.model('Card', cardSchema);
module.exports.templateCardModel = mongoose.model('TemplateCard', templateCardSchema);
module.exports.fieldsToPopulate = fieldsToPopulate;
module.exports.fieldsToProject = fieldsToProject;
module.exports.archiveFieldsToPopulate = archiveFieldsToPopulate;
