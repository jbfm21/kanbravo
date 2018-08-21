'use strict';

const async = require('async');
const _ = require('lodash');

const Logger = require('../logger/index').logger;
const AbstractLoggerInfo = require('../logger/index').loggerInfo;

const accessControl = require('../api-util/access-control');
const handleErrors = require('../api-util/handle-errors');
const cardIdConfigApi = require('./cardIdConfig').api;
const classOfServiceApi = require('./classOfService').api;
const customFieldConfigApi = require('./customFieldConfig').api;
const impedimentTypeApi = require('./impedimentType').api;
const itemSizeApi = require('./itemSize').api;
const itemTypeApi = require('./itemType').api;
const metricApi = require('./metric').api;
const priorityApi = require('./priority').api;
const trackerIntegrationApi = require('./trackerIntegration').api;
const projectApi = require('./project').api;
const tagApi = require('./tag').api;
const memberApi = require('./boardMember').api;
const agingApi = require('./aging').api;
const tagCategoryApi = require('./tagCategory').api;
const ratingTypeApi = require('./ratingType').api;

class BoardConfigApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('BoardApi', action);
    }
}

class BoardConfigApi
{
    constructor()
    {
    }

    getAllConfigs(req, res, next, returnWithNextCallBack, returnWithHashmap, fieldsToProject)
    {
        const loggerInfo = new BoardConfigApiLoggerInfo('getAllConfigs');
        const logger = new Logger(req.log);
        fieldsToProject = (fieldsToProject) ? fieldsToProject : [];

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        let allConfig = {};

        const callbackFn = (entityName, nextTask, err, entityValue) =>
        {
            if (returnWithHashmap)
            {
                allConfig[entityName] = _.fromPairs(entityValue.map((item) => [item._id.toString(), item]));
            }
            else
            {
                allConfig[entityName] = entityValue;
            }
            return nextTask(err);
        };
        const getAgings = (nextTask) => agingApi.searchByTitle(req, res, next, {projection: fieldsToProject.aging, callback: callbackFn.bind(this, 'agings', nextTask)});
        const getCardIdConfigs = (nextTask) => cardIdConfigApi.searchByTitle(req, res, next, {projection: fieldsToProject.cardIdConfig, callback: callbackFn.bind(this, 'cardIdConfigs', nextTask)});
        const getClassOfServices = (nextTask) => classOfServiceApi.searchByTitle(req, res, next, {projection: fieldsToProject.classOfService, callback: callbackFn.bind(this, 'classOfServices', nextTask)});
        const getCustomFieldConfigs = (nextTask) => customFieldConfigApi.searchByTitle(req, res, next, {projection: fieldsToProject.customFieldConfig, callback: callbackFn.bind(this, 'customFieldConfigs', nextTask)});
        const getImpedimentTypes = (nextTask) => impedimentTypeApi.searchByTitle(req, res, next, {projection: fieldsToProject.impedimentType, callback: callbackFn.bind(this, 'impedimentTypes', nextTask)});
        const getItemSizes = (nextTask) => itemSizeApi.searchByTitle(req, res, next, {projection: fieldsToProject.itemSize, callback: callbackFn.bind(this, 'itemSizes', nextTask)});
        const getItemTypes = (nextTask) => itemTypeApi.searchByTitle(req, res, next, {projection: fieldsToProject.itemType, callback: callbackFn.bind(this, 'itemTypes', nextTask)});
        const getMembers = (nextTask) => memberApi.search(req, res, next, {projection: fieldsToProject.assignedMembers, callback: callbackFn.bind(this, 'members', nextTask)});
        const getMetrics = (nextTask) => metricApi.searchByTitle(req, res, next, {projection: fieldsToProject.metric, callback: callbackFn.bind(this, 'metrics', nextTask)});
        const getPriorities = (nextTask) => priorityApi.searchByTitle(req, res, next, {projection: fieldsToProject.priority, callback: callbackFn.bind(this, 'priorities', nextTask)});
        const getProjects = (nextTask) => projectApi.searchByTitle(req, res, next, {projection: fieldsToProject.project, callback: callbackFn.bind(this, 'projects', nextTask)});
        const getRatingTypes = (nextTask) => ratingTypeApi.searchByTitle(req, res, next, {projection: fieldsToProject.ratingType, callback: callbackFn.bind(this, 'ratingTypes', nextTask)});
        const getTags = (nextTask) => tagApi.searchByTitle(req, res, next, {projection: fieldsToProject.tag, callback: callbackFn.bind(this, 'tags', nextTask)});
        const getTagCategories = (nextTask) => tagCategoryApi.searchByTitle(req, res, next, {projection: fieldsToProject.tagCategory, callback: callbackFn.bind(this, 'tagCategories', nextTask)});
        const getTrackerIntegrations = (nextTask) => trackerIntegrationApi.searchByTitle(req, res, next, {projection: fieldsToProject.trackerIntegration, callback: callbackFn.bind(this, 'trackerIntegrations', nextTask)});

        const endTask = (err) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }

            logger.info('Success', loggerInfo.create(dataToLog, 'Success'));
            if (returnWithNextCallBack)
            {
                return next(null, allConfig);
            }
            return res.json({data: allConfig});
        };

        async.waterfall([
            getAgings.bind(this),
            getCardIdConfigs.bind(this),
            getClassOfServices.bind(this),
            getCustomFieldConfigs.bind(this),
            getImpedimentTypes.bind(this),
            getItemSizes.bind(this),
            getItemTypes.bind(this).bind(this),
            getMembers.bind(this),
            getMetrics.bind(this),
            getPriorities.bind(this),
            getProjects.bind(this),
            getRatingTypes.bind(this),
            getTags.bind(this),
            getTagCategories.bind(this),
            getTrackerIntegrations.bind(this)]
            ,
            endTask.bind(this));
    }
}

let boardApi = new BoardConfigApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/allconfigs', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardApi.getAllConfigs.bind(boardApi));
};

module.exports.api = new BoardConfigApi();
