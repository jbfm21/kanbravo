'use strict';

//TODO: em breve será necessário utilizar cursor ao invés de stream,as futuras versões do mongoose suportam stream, será necessário testar toda a aplicação

const accessControl = require('../api-util/access-control');
const moment = require('moment');
const mongoose = require('mongoose');
const csv = require('csv');
const async = require('async');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const _ = require('lodash');
const Iconv = require('iconv-lite');

const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const AppError = require('../errors/app-error');
const dbManager = require('../db/index');
const commonUtil = require('../commons/index');

const delimiter = ';';

const BATCH_SIZE = 1000;

class ExportLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('exportApiF', action);
    }
}

class ExportPipeLine
{
    constructor(exportFileToDirectory, fromEncode, toEncode, userHashmap)
    {
        this.exportFileToDirectory = exportFileToDirectory;
        this.fromEncode = fromEncode;
        this.toEncode = toEncode;
        this.userHashmap = userHashmap;
    }

    addUserColumn(record, userField)
    {
        if (this.userHashmap[record[userField]])
        {
            record.userNickname = this.userHashmap[record[userField]].nickname;
            record.userFullName = `${this.userHashmap[record[userField]].givenname} ${this.userHashmap[record[userField]].surname}`;
        }
    }
    exportData(csvFileName, query, columns, transformFunction, nextTask)
    {
        const fileToSave = path.join(this.exportFileToDirectory, csvFileName);
        let writeStream = fs.createWriteStream(fileToSave, {defaultEncoding: this.fromEncode});
        let stringifier = (columns) ? csv.stringify({header: true, delimiter: delimiter, columns: columns, quoted: true, quotedEmpty: true}) : csv.stringify({header: true, delimiter: delimiter, quoted: true, quotedEmpty: true});
        query
        .stream()
        .pipe(csv.transform(transformFunction))
        .pipe(stringifier)
        .pipe(Iconv.decodeStream(this.fromEncode))
        .pipe(Iconv.encodeStream(this.toEncode))
        .pipe(writeStream);
         writeStream.on('close', function()
         {
            return nextTask(null);
         });
    }


    exportArray(csvFileName, arrayData, columns, transformFunction, nextTask)
    {
        const fileToSave = path.join(this.exportFileToDirectory, csvFileName);
        let writeStream = fs.createWriteStream(fileToSave, {defaultEncoding: this.fromEncode});
        let stringifier = (columns) ? csv.stringify({header: true, delimiter: delimiter, columns: columns, quoted: true, quotedEmpty: true}) : csv.stringify({header: true, delimiter: delimiter, quoted: true, quotedEmpty: true});

        commonUtil.arrayStream(arrayData)
        .pipe(csv.transform(transformFunction))
        .pipe(stringifier)
        .pipe(Iconv.decodeStream(this.fromEncode))
        .pipe(Iconv.encodeStream(this.toEncode))
        .pipe(writeStream);

         writeStream.on('close', function()
         {
            return nextTask(null);
         });
    }
}

class ExportApi
{
    _transformCard(record, dateFormat, userHashmap)
    {
        record.classOfService = (record.classOfService) ? record.classOfService.title : '';
        record.itemType = (record.itemType) ? record.itemType.title : '';
        record.tags = (record.tags) ? record.tags.map(item => item.title).join('|') : '';
        record.itemSize = (record.itemSize) ? record.itemSize.title : '';
        record.cardIdConfig = (record.cardIdConfig) ? record.cardIdConfig.title : '';
        record.priority = (record.priority) ? record.priority.title : '';
        record.project = (record.project) ? record.project.title : '';
        record.metric = (record.metric) ? record.metric.title : '';
        record.startPlanningDate = (record.startPlanningDate) ? moment(record.startPlanningDate).utc().format(dateFormat) : '';
        record.endPlanningDate = (record.endPlanningDate) ? moment(record.endPlanningDate).utc().format(dateFormat) : '';
        record.startExecutionDate = (record.startExecutionDate) ? moment(record.startExecutionDate).utc().format(dateFormat) : '';
        record.endExecutionDate = (record.endExecutionDate) ? moment(record.endExecutionDate).utc().format(dateFormat) : '';
        record.canceledDate = (record.canceledDate) ? moment(record.canceledDate).utc().format(dateFormat) : '';
        record.archivedDate = (record.archivedDate) ? moment(record.archivedDate).utc().format(dateFormat) : '';
        record.createdDate = (record.dateMetrics && record.dateMetrics.createdDate) ? moment(record.dateMetrics.createdDate).format(dateFormat) : '';
        record.startLeadTimeDate = (record.dateMetrics && record.dateMetrics.startLeadTimeDate) ? moment(record.dateMetrics.startLeadTimeDate).format(dateFormat) : '';
        record.endLeadTimeDate = (record.dateMetrics && record.dateMetrics.endLeadTimeDate) ? moment(record.dateMetrics.endLeadTimeDate).format(dateFormat) : '';
        record.startCycleTimeDate = (record.dateMetrics && record.dateMetrics.startCycleTimeDate) ? moment(record.dateMetrics.startCycleTimeDate).format(dateFormat) : '';
        record.endCycleTimeDate = (record.dateMetrics && record.dateMetrics.endCycleTimeDate) ? moment(record.dateMetrics.endCycleTimeDate).format(dateFormat) : '';
        record.customerLeadTime = (record.dateMetrics && record.dateMetrics.customerLeadTime) ? record.dateMetrics.customerLeadTime : '';
        record.leadTime = (record.dateMetrics && record.dateMetrics.leadTime) ? record.dateMetrics.leadTime : '';
        record.cycleTime = (record.dateMetrics && record.dateMetrics.cycleTime) ? record.dateMetrics.cycleTime : '';
        record.backlogTime = (record.dateMetrics && record.dateMetrics.backlogTime) ? record.dateMetrics.backlogTime : '';
        record.commitmentTime = (record.dateMetrics && record.dateMetrics.commitmentTime) ? record.dateMetrics.commitmentTime : '';
        record.deliveryTime = (record.dateMetrics && record.dateMetrics.deliveryTime) ? record.dateMetrics.deliveryTime : '';
        record.impedimentsCount = (record.impediments) ? record.impediments.length : 0;
        let assignedMembersNickName = _.map(record.assignedMembers, (member) => { if (member.user && userHashmap[member.user._id]) {return userHashmap[member.user._id].nickname;} return ''; });
        record.assignedMembers = _.join(assignedMembersNickName, '|');
        record.creatorNickName = (record.creator && userHashmap[record.creator]) ? userHashmap[record.creator].nickname : '';
        record.creatorFullName = (record.creator && userHashmap[record.owner]) ? `${userHashmap[record.creator].givenname} ${userHashmap[record.creator].surname}` : '';
        record.parentCardId = (record.parent) ? record.parent._id : '';
        record.parentCardTitle = (record.parent) ? record.parent.title : '';
        record.parentBoardId = (record.parent) ? record.parent.board._id : '';
        record.parentBoardTitle = (record.parent) ? record.parent.board.title : '';

        return record;
    }

    _createDir(dir)
    {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
    }

    _exportBoardConfigWithAssociatedUser(db, boardIdField, userField, boardId, exportPipeLane, csvFileName, nextTask)
    {
        const columns = null;
        exportPipeLane.exportData(
            csvFileName,
            db.find({[boardIdField]: boardId}).lean().batchSize(BATCH_SIZE),
            columns,
            record =>
            {
                exportPipeLane.addUserColumn(record, userField);
                return record;
            },
            nextTask
        );
    }

    _exportBoardLane(db, boardIdField, boardId, exportPipeLane, csvFileName, nextTask)
    {
        let query = db.findOne({[boardIdField]: boardId}).lean().batchSize(BATCH_SIZE);
        query.exec((err, boardLane) =>
        {
            if (!boardLane)
            {
                return nextTask(null);
            }
            const columns = null;
            let nodes = [];
            commonUtil.treeUtil.transversePreOrderAllNodesAndDoAction(boardLane.rootNode, (n) =>
            {
                let node = commonUtil.treeUtil.getNodeById(boardLane.rootNode, n._id, {addParentReference: true});
                if (!node.children)
                {
                    node.isChildren = true;
                }
                node.path = commonUtil.treeUtil.createNodePathString(node);
                node.parentId = (node.parent) ? node.parent._id : '';
                node.isChildren = node.children.length === 0;
                nodes.push(node);
            });
            nodes.forEach(n =>
            {
                n.children = null;
                n.parent = null;
            });
            //let leafNodes = commonUtil.treeUtil.getLeafNodes(boardLane.rootNode);
            return exportPipeLane.exportArray(csvFileName, nodes, columns, record =>
            {
                record.dateMetricConfig = null;
                record.parent = null;
                record.cards = record.cards.length;
                delete record.children;
                delete record.parent;
                delete record.dateMetricConfig;
                delete record.isCollapsed;
                return record;
            }, nextTask);
        });
    }

    _exportBoardConfig(db, boardIdField, boardId, exportPipeLane, csvFileName, nextTask)
    {
        const columns = null;
        exportPipeLane.exportData(csvFileName, db.find({[boardIdField]: boardId}).lean().batchSize(BATCH_SIZE), columns, record => record, nextTask);
    }

    _createDirectory(boardId)
    {
        const temporaryDir = serverConfig.directories.tempExportDir;
        const exportDir = path.join(temporaryDir, boardId + '_' + moment().format('YYYYMMDD_HHmmss'));
        const exportFileToDirectory = path.join(exportDir, 'files');
        this._createDir(exportDir);
        this._createDir(exportFileToDirectory);

        const exportZipDirectory = path.join(exportDir, 'zipFile');
        this._createDir(exportZipDirectory);

        return exportFileToDirectory;
    }

    exportData(req, res, next)
    {
        const dateFormat = 'DD/MM/YYYY HH:mm:ss';

        const logger = new Logger(req.log);
        const loggerInfo = new ExportLoggerInfo('exportData');

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};

        const exportFileToDirectory = this._createDirectory(boardId);

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        let exportPipeLine = null;
        const getMembersTask = (nextTask) => dbManager.boardMember.find({board: boardId}).lean().batchSize(BATCH_SIZE).populate('user').exec((err, members) =>
        {
            var userHashmap = _.fromPairs(members.map(function(item) {return [item.user._id.toString(), item.user];}));
            exportPipeLine = new ExportPipeLine(exportFileToDirectory, 'utf-8', 'win1252', userHashmap);
            return nextTask(err);
        });

        const exportBoardTask = (nextTask) => this._exportBoardConfigWithAssociatedUser(dbManager.board, '_id', 'owner', boardId, exportPipeLine, 'board.csv', nextTask);
        const exportBoardLaneTask = (nextTask) => this._exportBoardLane(dbManager.boardLane, 'board', boardId, exportPipeLine, 'boardLane.csv', nextTask);
        const exportBoardVisualStyleTask = (nextTask) => this._exportBoardConfig(dbManager.boardVisualStyle, 'board', boardId, exportPipeLine, 'boardVisualStyle.csv', nextTask);
        const exportAgingTask = (nextTask) => this._exportBoardConfig(dbManager.aging, 'board', boardId, exportPipeLine, 'aging.csv', nextTask);
        const exportCardIdConfigTask = (nextTask) => this._exportBoardConfig(dbManager.cardIdConfig, 'board', boardId, exportPipeLine, 'cardIdConfig.csv', nextTask);
        const exportClassOfServicesTask = (nextTask) => this._exportBoardConfig(dbManager.classOfService, 'board', boardId, exportPipeLine, 'classOfService.csv', nextTask);
        const exportCustomFieldConfigTask = (nextTask) => this._exportBoardConfig(dbManager.customFieldConfig, 'board', boardId, exportPipeLine, 'customFieldConfig.csv', nextTask);
        const exportImpedimentTypeTask = (nextTask) => this._exportBoardConfig(dbManager.impedimentType, 'board', boardId, exportPipeLine, 'impedimentType.csv', nextTask);
        const exportItemSizeTask = (nextTask) => this._exportBoardConfig(dbManager.itemSize, 'board', boardId, exportPipeLine, 'itemSize.csv', nextTask);
        const exportItemTypeTask = (nextTask) => this._exportBoardConfig(dbManager.itemType, 'board', boardId, exportPipeLine, 'itemType.csv', nextTask);
        const exportMetricTask = (nextTask) => this._exportBoardConfig(dbManager.metric, 'board', boardId, exportPipeLine, 'metric.csv', nextTask);
        const exportPriorityTask = (nextTask) => this._exportBoardConfig(dbManager.priority, 'board', boardId, exportPipeLine, 'priority.csv', nextTask);
        const exportProjectTask = (nextTask) => this._exportBoardConfig(dbManager.project, 'board', boardId, exportPipeLine, 'project.csv', nextTask);
        const exportRatingTypeTask = (nextTask) => this._exportBoardConfig(dbManager.ratingType, 'board', boardId, exportPipeLine, 'ratingType.csv', nextTask);
        const exportTagTask = (nextTask) => this._exportBoardConfig(dbManager.tag, 'board', boardId, exportPipeLine, 'tag.csv', nextTask);
        const exportTagCategoryTask = (nextTask) => this._exportBoardConfig(dbManager.tagCategory, 'board', boardId, exportPipeLine, 'tagCategory.csv', nextTask);
        const exportTaskTask = (nextTask) => this._exportBoardConfig(dbManager.task, 'board', boardId, exportPipeLine, 'task.csv', nextTask);
        const exportTaskTypeTask = (nextTask) => this._exportBoardConfig(dbManager.taskType, 'board', boardId, exportPipeLine, 'taskType.csv', nextTask);
        const exportTrackerIntegrationTask = (nextTask) => this._exportBoardConfig(dbManager.taskType, 'board', boardId, exportPipeLine, 'trackerIntegration.csv', nextTask);

        const exportTimesheetTask = (nextTask) =>
        {
            const columns = {
                _id: '_id', board: 'board', card: 'card',
                userNickname: 'userNickname', userFullName: 'userFullName',
                startDate: 'startDate', minutes: 'minutes',
                trackerStartDate: 'trackerStartDate', trackerEndDate: 'trackerEndDate', trackerMinutes: 'trackerMinutes'
            };
            exportPipeLine.exportData(
                'timesheet.csv',
                dbManager.timesheet.find({board: boardId}).lean().batchSize(BATCH_SIZE).select('_id board card user startDate minutes trackerStartDate trackerEndDate trackerMinutes'),
                columns,
                record =>
                {
                    exportPipeLine.addUserColumn(record, 'user');
                    record.startDate = moment(record.startDate).utc().format(dateFormat);
                    record.trackerStartDate = moment(record.trackerStartDate).format(dateFormat);
                    record.trackerEndDate = moment(record.trackerEndDate).format(dateFormat);
                    return record;
                },
                nextTask
            );
        };

        const exportCardMovementHistoryTask = (nextTask) =>
        {
            const columns = {
                _id: '_id', board: 'board', card: 'card',
                lane: 'lane',
                path: 'path',
                activity: 'activity',
                laneType: 'laneType',
                startDate: 'startDate'
            };

            let stream = dbManager.cardMovementHistory.aggregate([
                {$unwind: '$movements'},
                {$project: {board: 1, card: 1,
                    startDate: '$movements.startDate', laneType: '$movements.laneType',
                    path: '$movements.path', lane: '$movements.lane',
                    activity: '$movements.activity', _id: '$movements._id'}}
            ]).cursor({batchSize: BATCH_SIZE}).exec();

            exportPipeLine.exportData(
                'cardMovementHistory.csv',
                stream,
                columns,
                record =>
                {
                    record.startDate = moment(record.startDate).format(dateFormat);
                    return record;
                },
                nextTask
            );
        };

        const exportCardTask = (nextTask) =>
        {
            const columns = {
                _id: '_id', title: 'title',
                board: 'board',
                status: 'status',
                classOfService: 'classOfService', itemType: 'itemType',
                itemSize: 'itemSize', cardIdConfig: 'cardIdConfig',
                priority: 'priority',
                project: 'project',
                tags: 'tags', metricValue: 'metricValue',
                metric: 'metric', externalId: 'externalId',
                startPlanningDate: 'startPlanningDate', endPlanningDate: 'endPlanningDate',
                startExecutionDate: 'startExecutionDate', endExecutionDate: 'endExecutionDate',
                createdDate: 'createdDate',
                startLeadTimeDate: 'startLeadTimeDate', endLeadTimeDate: 'endLeadTimeDate',
                startCycleTimeDate: 'startCycleTimeDate', endCycleTimeDate: 'endCycleTimeDate',
                customerLeadTime: 'customerLeadTime', impedimentsCount: 'impedimentsCount',
                assignedMembers: 'assignedMembers',
                priorityNumber: 'priorityNumberValue',
                creatorNickName: 'creatorNickName',
                creatorFullName: 'creatorFullName',
                parentCardId: 'parentCardId',
                parentCardTitle: 'parentCardTitle',
                parentBoardId: 'parentBoardId',
                parentBoardTitle: 'parentBoardTitle'
            };
            exportPipeLine.exportData(
                'card.csv',
                dbManager.card.find({board: boardId}).select('-description').populate(dbManager.card.fieldsToPopulate).lean().batchSize(BATCH_SIZE),
                columns,
                record => this._transformCard(record, dateFormat, exportPipeLine.userHashmap),
                nextTask
            );
        };

        const exportCardAssignedMembersTask = (nextTask) =>
        {
            let query = dbManager.card.aggregate([
                {$match: {board: mongoose.Types.ObjectId(boardId)}},
                {$project: {_id: 1, assignedMembers: 1, status: 1}},
                {$unwind: '$assignedMembers'},
                {$lookup: {
                        from: 'boardmembers',
                        localField: 'assignedMembers',
                        foreignField: '_id',
                        as: 'member'
                    }
                },
                {$unwind: '$member'},
                {$project: {_id: 1, userId: '$member.user', status: 1}}
            ]).cursor().exec();
            const columns = {
                _id: '_id',
                status: 'status',
                userNickname: 'userNickname', userFullName: 'userFullName'
            };
            exportPipeLine.exportData(
                'assignedMemberCards.csv',
                query,
                columns,
                record =>
                {
                    exportPipeLine.addUserColumn(record, 'userId');
                    return record;
                },
                nextTask
            );
        };

        const exportImpedimentsTask = (nextTask) =>
        {
            const columns = {
                _id: '_id', board: 'board', card: 'card',
                type: 'type', reason: 'reason',
                startDate: 'startDate', endDate: 'endDate'
            };
            exportPipeLine.exportData(
                'impediment.csv',
                dbManager.impediment.find({board: boardId}).lean().batchSize(BATCH_SIZE).populate('type'),
                columns,
                record =>
                {
                    record.type = record.type.title;
                    record.startDate = moment(record.startDate).format(dateFormat);
                    record.endDate = moment(record.endDate).format(dateFormat);
                    return record;
                },
                nextTask
            );
        };

        const exportRemindersTask = (nextTask) =>
        {
            const columns = {
                _id: '_id', board: 'board', card: 'card',
                description: 'description', date: 'date', completed: 'completed'
            };
            exportPipeLine.exportData(
                'reminder.csv',
                dbManager.reminder.find({board: boardId}).lean().batchSize(BATCH_SIZE),
                columns,
                record =>
                {
                    record.date = moment(record.date).utc().format(dateFormat);
                    return record;
                },
                nextTask
            );
        };

        const exportCommentsTask = (nextTask) =>
        {
            const columns = {
                _id: '_id', board: 'board', card: 'card',
                text: 'text', author: 'author',
                authorNickname: 'authorNickname', authorFullName: 'authorFullName',
                createdDate: 'createdDate', updatedDate: 'updatedDate'
            };
            exportPipeLine.exportData(
                'comments.csv',
                dbManager.comment.find({board: boardId}).lean().batchSize(BATCH_SIZE),
                columns,
                record =>
                {
                    exportPipeLine.addUserColumn(record, 'author');
                    record.createdDate = moment(record.createdDate).format(dateFormat);
                    record.updatedDate = moment(record.updatedDate).format(dateFormat);
                    return record;
                },
                nextTask
            );
        };

        const exportCardCustomField = (nextTask) =>
        {
            const columns = {
                board: 'board', card: 'card',
                typeId: 'typeId',
                typeTitle: 'typeTitle', value: 'value'
            };

            let stream = dbManager.cardCustomField.aggregate([
                {$unwind: '$fields'},
                {$lookup: {from: 'customfieldconfigs', localField: 'fields.type', foreignField: '_id', as: 'type'}},
                {$unwind: '$type'},
                {$project: {board: 1, card: 1, typeId: '$type._id', typeTitle: '$type.title', value: '$fields.value'}}
            ]).cursor({batchSize: BATCH_SIZE}).exec();

            exportPipeLine.exportData(
                'cardCustomField.csv',
                stream,
                columns,
                record => record,
                nextTask
            );
        };

        const compressFiles = (nextTask) =>
        {
            let archive = archiver('zip');
            let zipFile = path.join(exportFileToDirectory.replace("/files", "/zipFile"), 'export.zip');
            var output = fs.createWriteStream(zipFile, {defaultEncoding: 'utf8'});
            output.on('close', function()
            {
                return nextTask(null, zipFile);
            });
            archive.directory(exportFileToDirectory, 'files');
            archive.pipe(output);
            archive.finalize();
        };

        const endTask = (err, zipFile) => //eslint-disable-line
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
                return next(new AppError(res.__('INVALID_REQUEST')));
            }

            fs.readFile(zipFile, function(innerErr, file)
            {
                if (innerErr)
                {
                    logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
                    return next(new AppError(res.__('INVALID_REQUEST')));
                }
                res.writeHead(200,
                {
                    'Content-Type': 'application/zip"',
                    'Content-Disposition': 'attachment; filename=export.tar.gz'
                });
                res.write(file);
                res.end();
                return next();
            });
        };

        async.waterfall([getMembersTask.bind(this), exportBoardTask.bind(this),
            exportBoardLaneTask.bind(this),
            exportBoardVisualStyleTask.bind(this),
            exportAgingTask.bind(this),
            exportCardIdConfigTask.bind(this),
            exportClassOfServicesTask.bind(this),
            exportCustomFieldConfigTask.bind(this),
            exportImpedimentTypeTask.bind(this),
            exportItemSizeTask.bind(this),
            exportItemTypeTask.bind(this),
            exportMetricTask.bind(this),
            exportPriorityTask.bind(this),
            exportProjectTask.bind(this),
            exportRatingTypeTask.bind(this),
            exportTagTask.bind(this),
            exportTagCategoryTask.bind(this),
            exportTaskTask.bind(this),
            exportTaskTypeTask.bind(this),
            exportTrackerIntegrationTask.bind(this),
            exportCardMovementHistoryTask.bind(this),
            exportTimesheetTask.bind(this),
            exportCardTask.bind(this),
            exportCardAssignedMembersTask.bind(this),
            exportImpedimentsTask.bind(this),
            exportCommentsTask.bind(this),
            exportRemindersTask.bind(this),
            exportCardCustomField.bind(this),
            compressFiles.bind(this)],
            endTask.bind(this));
    }

}

let exportApi = new ExportApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/export', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, exportApi.exportData.bind(exportApi));
};

module.exports.api = new ExportApi();

