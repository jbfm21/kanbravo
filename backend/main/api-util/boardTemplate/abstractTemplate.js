'use strict';

const async = require('async');
const dbPriority = require('../../db/priority');
const dbClassOfService = require('../../db/classOfService');
const dbItemType = require('../../db/itemType');
const dbItemSize = require('../../db/itemSize');
const dbMetric = require('../../db/metric');
const dbRatingType = require('../../db/ratingType');
const dbImpedimentType = require('../../db/impedimentType');
const dbTaskType = require('../../db/taskType');
const dbAging = require('../../db/aging');


class AbstractTemplate
{
    constructor(logger, loggerInfo, board, createLayoutFn, priorities, classOfServices, itemTypes, itemSizes, metrics, ratingTypes, taskTypes, impedimentTypes, agings)
    {
        this.board = board;
        this.logger = logger;
        this.loggerInfo = loggerInfo;
        this.priorities = priorities;
        this.classOfServices = classOfServices;
        this.itemTypes = itemTypes;
        this.ratingTypes = ratingTypes;
        this.itemSizes = itemSizes;
        this.metrics = metrics;
        this.taskTypes = taskTypes;
        this.impedimentTypes = impedimentTypes;
        this.agings = agings;
        this.createLayoutFn = createLayoutFn;
    }

    _createLayout(nextTask)
    {
        if (!this.createLayoutFn)
        {
            return nextTask(null);
        }
        return this.createLayoutFn(nextTask);
    }

    _insertIntoDatabase(logger, db, entities, nextTask)
    {
        if (!entities || entities.length === 0)
        {
            return nextTask(null);
        }
        db.collection.insert(entities, (err, savedEntities) => //eslint-disable-line
        {
            this.logger.info('CreateTemplate', this.loggerInfo.create(db.modelName, (err) ? 'fail' : 'success'));
            return nextTask(err);
        });
        return null;
    }

    _createBoardPriorities(nextTask) { this._insertIntoDatabase(this.logger, dbPriority, this.priorities, nextTask);}
    _createClassOfService(nextTask) { this._insertIntoDatabase(this.logger, dbClassOfService, this.classOfServices, nextTask);}
    _createItemTypes(nextTask) { this._insertIntoDatabase(this.logger, dbItemType, this.itemTypes, nextTask);}
    _createItemSizes(nextTask) { this._insertIntoDatabase(this.logger, dbItemSize, this.itemSizes, nextTask);}
    _createMetrics(nextTask) { this._insertIntoDatabase(this.logger, dbMetric, this.metrics, nextTask);}
    _createRatingTypes(nextTask) { this._insertIntoDatabase(this.logger, dbRatingType, this.ratingTypes, nextTask);}
    _createTaskTypes(nextTask) { this._insertIntoDatabase(this.logger, dbTaskType, this.taskTypes, nextTask);}
    _createImpedimentTypes(nextTask) { this._insertIntoDatabase(this.logger, dbImpedimentType, this.impedimentTypes, nextTask);}
    _createAgings(nextTask) { this._insertIntoDatabase(this.logger, dbAging, this.agings, nextTask);}

    _endTask(nextTask)
    {
         return nextTask(null, this.board);
    }

    createTemplateInstance(outerNextTask)
    {
        async.waterfall([
                this._createLayout.bind(this),
                this._createBoardPriorities.bind(this),
                this._createClassOfService.bind(this),
                this._createItemTypes.bind(this),
                this._createItemSizes.bind(this),
                this._createMetrics.bind(this),
                this._createRatingTypes.bind(this),
                this._createTaskTypes.bind(this),
                this._createImpedimentTypes.bind(this),
                this._createAgings.bind(this),
                this._endTask.bind(this)],
            outerNextTask.bind(this)); //eslint-disable0line consistent-return
    }

}

module.exports = AbstractTemplate;
