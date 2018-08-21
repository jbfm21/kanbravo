'use strict';

const aging = require('./aging');
const attachmentSchema = require('./attachmentSchema');
const avatarSchema = require('./avatarSchema');
const BaseBoardConfigSchema = require('./BaseBoardConfigSchema');
const BaseCardInfoSchema = require('./BaseCardInfoSchema');
const board = require('./board');
const boardLane = require('./boardLane');
const boardMember = require('./boardMember');
const boardMemberPreferenceSchema = require('./boardMemberPreferenceSchema');
const boardVisualStyle = require('./boardVisualStyle');
const card = require('./card');
const cardCustomField = require('./cardCustomField');
const cardIdConfig = require('./cardIdConfig');
const cardMovementHistory = require('./cardMovementHistory');
const classOfService = require('./classOfService');
const colorSchema = require('./colorSchema');
const comment = require('./comment');
const customFieldConfig = require('./customFieldConfig');
const customValidators = require('./customValidators');
const dateMetricsSchema = require('./dateMetricsSchema');
const feedback = require('./feedback');
const impediment = require('./impediment');
const impedimentType = require('./impedimentType');
const index = require('./index');
const itemSize = require('./itemSize');
const itemType = require('./itemType');
const metric = require('./metric');
const mongoUtils = require('./mongo-utils');
const priority = require('./priority');
const project = require('./project');
const ratingSchema = require('./ratingSchema');
const ratingType = require('./ratingType');
const reminder = require('./reminder');
const tag = require('./tag');
const tagCategory = require('./tagCategory');
const task = require('./task');
const taskType = require('./taskType');
const timesheet = require('./timesheet');
const trackerIntegration = require('./trackerIntegration');
const user = require('./user');

const models = {
    BaseBoardConfigSchema: BaseBoardConfigSchema,
    BaseCardInfoSchema: BaseCardInfoSchema,
    mongoUtils: mongoUtils,
    aging: aging,
    attachmentSchema: attachmentSchema,
    avatarSchema: avatarSchema,
    board: board,
    boardLane: boardLane,
    boardMember: boardMember,
    boardMemberPreferenceSchema: boardMemberPreferenceSchema,
    boardVisualStyle: boardVisualStyle,
    card: card,
    cardCustomField: cardCustomField,
    cardIdConfig: cardIdConfig,
    cardMovementHistory: cardMovementHistory,
    classOfService: classOfService,
    colorSchema: colorSchema,
    comment: comment,
    customFieldConfig: customFieldConfig,
    customValidators: customValidators,
    dateMetricsSchema: dateMetricsSchema,
    feedback: feedback,
    impediment: impediment,
    impedimentType: impedimentType,
    index: index,
    itemSize: itemSize,
    itemType: itemType,
    metric: metric,
    priority: priority,
    project: project,
    ratingSchema: ratingSchema,
    ratingType: ratingType,
    reminder: reminder,
    tag: tag,
    tagCategory: tagCategory,
    task: task,
    taskType: taskType,
    timesheet: timesheet,
    trackerIntegration: trackerIntegration,
    user: user
};

module.exports = models  //eslint-disable-line

