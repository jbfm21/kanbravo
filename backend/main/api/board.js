'use strict';

const async = require('async');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');

const db = require('../db/index');
const enums = require('../enums/index');
const errors = require('../errors/index');
const commonUtils = require('../commons/index');

const Logger = require('../logger/index').logger;
const AbstractLoggerInfo = require('../logger/index').loggerInfo;

const accessControl = require('../api-util/access-control');
const handleErrors = require('../api-util/handle-errors');
const apiUtils = require('../api-util/api-utils');
const directoryManager = require('../api-util/directory-manager').BoardDirectoryManager;
const TemplateFactory = require('../api-util/boardTemplate/templateFactory');

const boardLaneApi = require('./boardLane').api;

const VISUAL_STYLE_LIST = [{title: 'Completo', type: 'full', orientation: 'horizontal'}, {title: 'Compacto', type: 'compact', orientation: 'horizontal'}, {title: 'Quadro Vertical', type: 'full', orientation: 'vertical'}];

class BoardApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('BoardApi', action);
    }
}

class BoardApi
{
    constructor()
    {
    }

    findAll(req, res, next)
    {
        const loggerInfo = new BoardApiLoggerInfo('findAll');
        const logger = new Logger(req.log);

        let user = req.user;

        logger.debug('Start');

        const getUserBoardsTask = (nextTask) => db.boardMember.findWithoutDeleted({user: user._id.toString()}).select('board -_id').lean().exec(nextTask);

        const getBoardsTask = (userBoards, nextTask) =>
        {
              const boardIdList = _.map(userBoards, (item) => item.board);
              return db.board.findWithoutDeleted({$or: [
                  {visibility: enums.boardVisibility.publicWrite.name},
                  {visibility: enums.boardVisibility.public.name},
                  {_id: {$in: boardIdList}}]
            }).lean().exec((err, boards) => nextTask(err, userBoards, boards));
        };

        const getMemberOfBoardsTask = (userBoards, boards, nextTask) =>
        {
            const boardIds = _.map(boards, (item) => item._id);
            const o = {
                map: function() {emit(this.board, 1);}, //eslint-disable-line no-undef
                reduce: function(k, vals) {return vals.length || 0;},
                query: {board: {$in: boardIds}, deleted: {$ne: true}}
            };
            db.boardMember.mapReduce(o, (err, membersOfBoards) => nextTask(err, userBoards, boards, membersOfBoards));
        };

        const getBoardCardsTask = (userBoards, boards, membersOfBoards, nextTask) =>
        {
            const boardIds = _.map(boards, (item) => item._id);
            const o = {
                map: function() {emit(this.board, 1);}, //eslint-disable-line no-undef
                reduce: function(k, vals) {return vals.length || 0;},
                query: {board: {$in: boardIds}, status: enums.cardStatus.inboard.name}
            };
            db.card.mapReduce(o, (err, cardsOfBoards) => nextTask(err, userBoards, boards, membersOfBoards, cardsOfBoards));
        };

        const endTask = (err, userBoards, boards, membersOfBoards, cardsOfBoards) =>
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            _.map(boards, (board) =>
            {
                let numberOfMembers = _.find(membersOfBoards, (item) => item._id.toString() === board._id.toString());
                let numberOfCards = _.find(cardsOfBoards, (item) => item._id.toString() === board._id.toString());
                board['numberOfMembers'] = (numberOfMembers) ? numberOfMembers.value : 0; //eslint-disable-line dot-notation
                board['numberOfCards'] = (numberOfCards) ? numberOfCards.value : 0; //eslint-disable-line dot-notation
                board['isMemberOf'] = _.some(userBoards, (item) => item.board.toString() === board._id.toString()); //eslint-disable-line dot-notation
                return board;
            });
            logger.debug('finished');
            return res.json({data: boards});
        };

        async.waterfall([getUserBoardsTask.bind(this), getBoardsTask.bind(this), getMemberOfBoardsTask.bind(this), getBoardCardsTask.bind(this)], endTask.bind(this));
    }

    findById(req, res, next)
    {
        const loggerInfo = new BoardApiLoggerInfo('findById');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getBoardTask = (nextTask) => db.board.findById(boardId).lean().exec(nextTask);

        const getBoardLaneTask = (board, nextTask) => boardLaneApi.getBoardLane(req, res, (err, boardLane) => nextTask(err, board, boardLane), true);

        const getBoardVisualStylesTask = (board, orderedBoardLaneTree, nextTask) => nextTask(null, board, orderedBoardLaneTree, VISUAL_STYLE_LIST);

        const getTagCategoriesTask = (board, orderedBoardLaneTree, boardVisualStyles, nextTask) =>
        {
            return db.tagCategory.findWithoutDeleted({board: boardId}, (err, tagCategories) => nextTask(err, board, orderedBoardLaneTree, boardVisualStyles, tagCategories));
        };

        const getBoardSwimLaneStylesTask = (board, orderedBoardLaneTree, boardVisualStyles, tagCategories, nextTask) =>
        {
            //TODO: centralizar os swimlanes padrões e colocar como enum
            let boardSwimLaneStyles = [
                {icon: '', title: 'Nenhuma', type: 'none'},
                {icon: 'legal', title: 'Classe de Serviço', type: 'classOfServices', property: 'classOfService'},
                {icon: 'payment', title: 'Id. Externo', type: 'cardIdConfigs', property: 'cardIdConfig'},
                {icon: 'users', title: 'Membros', type: 'members', property: 'assignedMembers'},
                {icon: 'line chart', title: 'Métricas', type: 'metrics', property: 'metric'},
                {icon: 'flag', title: 'Prioridades', type: 'priorities', property: 'priority'},
                {icon: 'folder open', title: 'Projeto', type: 'projects', property: 'project'},
                {icon: 'maximize', title: 'Tamanho de Item', type: 'itemSizes', property: 'itemSize'},
                {icon: 'block layout', title: 'Tipos de Item', type: 'itemTypes', property: 'itemType'},
                {icon: 'retweet', title: 'Integrações', type: 'trackerIntegrations', property: 'trackerIntegration'}
            ];

            for (let i in tagCategories) //eslint-disable-line
            {
                const tagCategory = tagCategories[i];
                const avatar = (tagCategory.avatar) ? tagCategory.avatar : {icon: 'tag'};
                boardSwimLaneStyles.push({icon: avatar, title: tagCategory.title, type: 'tagCategory', property: 'tags', id: tagCategory._id, wipLimit: tagCategory.wipLimit});
            }
            return nextTask(null, board, orderedBoardLaneTree, boardVisualStyles, boardSwimLaneStyles);
        };

        const endTask = (err, board, orderedBoardLaneTree, boardVisualStyles, boardSwimLaneStyles) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, board));
            board['layout'] = orderedBoardLaneTree; //eslint-disable-line
            board['visualStyles'] = boardVisualStyles; //eslint-disable-line
            board['swimLaneStyles'] = boardSwimLaneStyles; //eslint-disable-line
            return res.json({data: board});
        };
        async.waterfall([getBoardTask.bind(this), getBoardLaneTask.bind(this), getBoardVisualStylesTask.bind(this), getTagCategoriesTask.bind(this), getBoardSwimLaneStylesTask.bind(this)], endTask.bind(this));
    }

    getBoardCalendar(req, res, next) //eslint-disable-line
    {
        const loggerInfo = new BoardApiLoggerInfo('getBordCalendar');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const startDate = req.params.startDate;
        const viewMode = req.params.viewMode;

        const momentStartDate = moment.utc(startDate, 'YYYYMMDD');

        let queryMomentStartDate = null;
        let queryMomentEndDate = null;

        switch (viewMode)
        {
            case enums.calendarViewMode.day.name:
            case enums.calendarViewMode.week.name:
                queryMomentStartDate = momentStartDate.clone().startOf(viewMode);
                queryMomentEndDate = momentStartDate.clone().endOf(viewMode);
                break;
            default:
                queryMomentStartDate = momentStartDate.clone().startOf(enums.calendarViewMode.month.name);
                queryMomentEndDate = momentStartDate.clone().endOf(enums.calendarViewMode.month.name);
        }

        const queryStartDate = queryMomentStartDate.toDate().toISOString();
        const queryEndDate = queryMomentEndDate.toDate().toISOString();

        const dataToLog = {boardId: boardId, startDate: startDate, viewMode: viewMode};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getBoardTask = (nextTask) => db.board.findById(boardId).lean().exec(nextTask);

        const getBoardCardsTask = (board, nextTask) =>
        {
            return db.card.find({
                    board: boardId,
                    $or: [
                        {startPlanningDate: {$gte: queryStartDate, $lte: queryEndDate}},
                        {endPlanningDate: {$gte: queryStartDate, $lte: queryEndDate}},
                        {startExecutionDate: {$gte: queryStartDate, $lte: queryEndDate}},
                        {endExecutionDate: {$gte: queryStartDate, $lte: queryEndDate}}
                    ]
            }).lean().exec((err, cards) => nextTask(err, board, cards));
        };

        const getBoardRemindersTask = (board, cards, nextTask) =>
        {
            return db.reminder.find({board: boardId, date: {$gte: queryStartDate, $lte: queryEndDate}}).populate({path: 'card', select: '_id board title status'}).lean().exec((err, reminders) => nextTask(err, board, cards, reminders));
        };

        const getBoardTimeSheetsTask = (board, cards, reminders, nextTask) =>
        {
            return db.timesheet.find({board: boardId, startDate: {$gte: queryStartDate, $lte: queryEndDate}}).populate([{path: 'user', select: '_id nonce nickname givenname surname avatar'}, {path: 'card', select: '_id board title status'}]).lean().exec((err, timesheetEvents) => nextTask(err, board, cards, reminders, timesheetEvents));
        };

        const endTask = (err, board, cards, reminders, timesheetEvents) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }

            let calendarEvents = [];

            let fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek = (dateToFix) => new Date(dateToFix.getTime() + 10000); //(https://github.com/intljusticemission/react-big-calendar/issues/159) - somar alguns milisegundos na data final
            cards = [].concat(cards);
            reminders = [].concat(reminders);
            _.forEach(cards, (card) =>
            {
                if (card.startPlanningDate && commonUtils.momentUtil.isInInterval(card.startPlanningDate, queryMomentStartDate, queryMomentEndDate))
                {
                    calendarEvents.push({title: card.title, type: enums.calendarEventType.startPlanningDate.name, isAllDayEvent: true, startDate: card.startPlanningDate, endDate: fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek(card.startPlanningDate), executionDate: card.startExecutionDate, card: {_id: card._id, board: card.board, status: card.status}});
                }
                if (card.endPlanningDate && commonUtils.momentUtil.isInInterval(card.endPlanningDate, queryMomentStartDate, queryMomentEndDate))
                {
                    calendarEvents.push({title: card.title, type: enums.calendarEventType.endPlanningDate.name, isAllDayEvent: true, startDate: card.endPlanningDate, endDate: fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek(card.endPlanningDate), executionDate: card.endExecutionDate, card: {_id: card._id, board: card.board, status: card.status}});
                }
                if (card.startExecutionDate && commonUtils.momentUtil.isInInterval(card.startExecutionDate, queryMomentStartDate, queryMomentEndDate))
                {
                    calendarEvents.push({title: card.title, type: enums.calendarEventType.startExecutionDate.name, isAllDayEvent: true, startDate: card.startExecutionDate, endDate: fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek(card.startExecutionDate), planningDate: card.startPlanningDate, card: {_id: card._id, board: card.board, status: card.status}});
                }
                if (card.endExecutionDate && commonUtils.momentUtil.isInInterval(card.endExecutionDate, queryMomentStartDate, queryMomentEndDate))
                {
                     calendarEvents.push({title: card.title, type: enums.calendarEventType.endExecutionDate.name, isAllDayEvent: true, startDate: card.endExecutionDate, endDate: fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek(card.endExecutionDate), planningDate: card.endPlanningDate, card: {_id: card._id, board: card.board, status: card.status}});
                }
            });

            _.forEach(reminders, (reminder) =>
            {
                calendarEvents.push({title: reminder.description, type: enums.calendarEventType.reminder.name, isAllDayEvent: true, startDate: reminder.date, endDate: fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek(reminder.date), completed: reminder.completed, card: reminder.card});
            });

            _.forEach(timesheetEvents, (timesheetEvent) =>
            {
                calendarEvents.push({type: enums.calendarEventType.timesheet.name, isAllDayEvent: true, startDate: timesheetEvent.startDate, endDate: fixEndDateBecauseReactCalendarBugThatDoestShowDataInFirstDayOfWeek(timesheetEvent.startDate), user: timesheetEvent.user, minutes: timesheetEvent.minutes, card: timesheetEvent.card});
            });

            logger.info('Success', loggerInfo.create(dataToLog, board));
            return res.json({data: {board: board._id, calendarEvents: calendarEvents}});

        };

        async.waterfall([getBoardTask.bind(this), getBoardCardsTask.bind(this), getBoardRemindersTask.bind(this), getBoardTimeSheetsTask.bind(this)], endTask.bind(this));
    }

    getProjectCardStatistic(req, res, next) //eslint-disable-line
    {
        const loggerInfo = new BoardApiLoggerInfo('getProjectCardStatistic');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getBoardTask = (nextTask) => db.board.findById(boardId).lean().exec(nextTask);

        const getBoardLaneTask = (board, nextTask) => boardLaneApi.getBoardLane(req, res, (err, boardLane) => nextTask(err, board, boardLane), true);

        const endTask = (err, board, boardLane) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }

            logger.info('Success', loggerInfo.create(dataToLog, board));

            let root = boardLane.rootNode;
            let projects = [];

            _(root.children).each(topNode =>
            {
                let leafNodes = commonUtils.treeUtil.getLeafNodes(topNode);
                leafNodes = _.flattenDeep(leafNodes);
                _(leafNodes).each(leafNode =>
                {
                    _(leafNode.cards).filter(card => card.project).each(card =>
                    {
                        if (!projects[card.project.title]) {projects[card.project.title] = {avatar: card.project.avatar, lanes: []};}
                        if (!projects[card.project.title].lanes[topNode.title]) {projects[card.project.title].lanes[topNode.title] = 0;}
                        projects[card.project.title].lanes[topNode.title]++;
                    });
                });
            });

            let projectOutput = Object.keys(projects).map(projectKey =>
            {
                let lanes = Object.keys(projects[projectKey].lanes).map(laneKey =>
                {
                    let project = projects[projectKey];
                    return {title: laneKey, cards: project.lanes[laneKey]};
                });
                return {title: projectKey, avatar: projects[projectKey].avatar, lanes: lanes};
            });

            return res.json({data: {board: board._id, projects: projectOutput}});

        };

        async.waterfall([getBoardTask.bind(this), getBoardLaneTask.bind(this)], endTask.bind(this));

    }

    add(req, res, next) //eslint-disable-line consistent-return
    {
        const loggerInfo = new BoardApiLoggerInfo('add');
        const logger = new Logger(req.log);

        let dataToAdd = apiUtils.getBodyModel(req);

        const user = req.user;

        logger.debug('Start', loggerInfo.create(dataToAdd, 'Start'));

        if (!dataToAdd)
        {
            return next(new errors.appError(res.__('INVALID_REQUEST')));
        }

        let entityToSave = new db.board(dataToAdd);

        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        const avatarImageFileName = (avatarImageFile) ? directoryManager.getRelativeDir(entityToSave._id.toString()) + '/' + path.basename(avatarImageFile.path) : null;

        entityToSave['avatar'] = {imageSrc: avatarImageFileName}; //eslint-disable-line dot-notation
        entityToSave['owner'] = user._id;  //eslint-disable-line dot-notation

        const validationError = entityToSave.validateSync();
        if (validationError)
        {
            logger.error('InvalidFormData', loggerInfo.create(dataToAdd, validationError));
            return next(new errors.formError(validationError.errors));
        }

        const createBoardTask = (nextTask) => entityToSave.save(nextTask);

        const createTemplateTask = (savedBoard, numAffected, nextTask) =>
        {
            const template = TemplateFactory.getTemplate(savedBoard.boardTemplate, logger, loggerInfo, savedBoard);
            template.createTemplateInstance(nextTask);
        };

        const createBoardAvatarTask = (savedBoard, nextTask) => //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedBoard);
            }
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(savedBoard._id.toString(), avatarImageFile, (err) => nextTask(err, savedBoard));
        };

        const createBoardMemberTask = (savedBoard, nextTask) =>
        {
            let boardMember = new db.boardMember({board: savedBoard._id, user: user._id, role: 'member', boardPreference: {}});
            boardMember.save((err, savedBoardMember) => nextTask(err, savedBoard, savedBoardMember));
        };

        const endTask = (err, savedBoard, savedBoardMember) => //eslint-disable-line no-unused-vars
        {
            if (handleErrors.handleAddError(req, res, next, logger, loggerInfo, err, dataToAdd, entityToSave, savedBoard))
            {
                return null;
            }

            let savedBoardObj = savedBoard.toObject();
            //Preenche manualmente os campos que são computados pelo método de lista
            savedBoardObj['numberOfMembers'] = 1; //eslint-disable-line dot-notation
            savedBoardObj['numberOfCards'] = 0; //eslint-disable-line dot-notation
            savedBoardObj['isMemberOf'] = true; //eslint-disable-line dot-notation

            logger.info('Success', loggerInfo.create(dataToAdd, `id: ${savedBoardObj._id}`));
            return res.send(201, {data: savedBoardObj});
        };
        async.waterfall([createBoardTask.bind(this), createTemplateTask.bind(this), createBoardAvatarTask.bind(this), createBoardMemberTask.bind(this)], endTask.bind(this)); //eslint-disable0line consistent-return
    }

    delete(req, res, next)
    {
        const loggerInfo = new BoardApiLoggerInfo('delete');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const checkIfUserIsBoardOwnerTask = (nextTask) =>
        {
            db.board.findOneWithoutDeleted({_id: boardId, owner: req.user._id}, (err, result) => //eslint-disable-line
            {
                if (err) {return nextTask(err);}
                if (!result)
                {
                    return next(new errors.appError(res.__('ONLY_OWNER_CAN_DELETE_BOARD')));
                }
                return nextTask(null);
            });
        };

        const deleteEntityTask = (nextTask) => db.board.delete({_id: boardId, owner: req.user._id}, nextTask);

        const endTask = (err, deletedEntity) =>
        {
            if (handleErrors.handleDeleteError(req, res, next, logger, loggerInfo, err, dataToLog, deletedEntity))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, 'entity deleted'));
            return res.send(200, {data: ''});
        };

        async.waterfall([checkIfUserIsBoardOwnerTask.bind(this), deleteEntityTask.bind(this)], endTask.bind(this));
    }

    update(req, res, next)
    {
        const loggerInfo = new BoardApiLoggerInfo('update');
        const logger = new Logger(req.log);

        const id = req.params.boardId;

        const dataToUpdate = apiUtils.getBodyModel(req);
        const dataToLog = {boardId: id, dataToUpdate: dataToUpdate};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        if (!dataToUpdate)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new errors.appError(res.__('INVALID_REQUEST')));
        }

        dataToUpdate._id = id;
        delete dataToUpdate.owner;
        delete dataToUpdate.boardTemplate;

        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        const avatarImageFileName = (avatarImageFile) ? directoryManager.getRelativeDir(dataToUpdate._id.toString()) + '/' + path.basename(avatarImageFile.path) : null;
        if (avatarImageFile)
        {
            dataToUpdate['avatar'] = {imageSrc: avatarImageFileName}; //eslint-disable-line dot-notation
        }

        let entityToSave = new db.board(dataToUpdate);

        const validationError = entityToSave.validateSync();
        if (validationError)
        {
            logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
            return next(new errors.formError(validationError.errors));
        }

        const updateQuery = db.board.findOneAndUpdate({_id: id}, dataToUpdate, {new: true});

        const updateEntityTask = (nextTask) => updateQuery.exec(nextTask);

        const createAvatarTask = (savedEntity, nextTask) => //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedEntity);
            }
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(savedEntity._id.toString(), avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const endTask = (err, updatedEntity) =>
        {
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, db.board, id, entityToSave, updatedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, `id: ${updatedEntity._id}`));
                return res.send(201, {data: updatedEntity});
            });
        };

        return async.waterfall([updateEntityTask.bind(this), createAvatarTask.bind(this)], endTask.bind(this));
    }
}

let boardApi = new BoardApi();
module.exports = function(server)
{
    server.get({path: '/boards', version: '1.0.0'}, accessControl.ensureAuthenticated, boardApi.findAll.bind(boardApi));
    server.get({path: '/boards/:boardId', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardApi.findById.bind(boardApi));
    server.get({path: '/boards/:boardId/calendar', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardApi.getBoardCalendar.bind(boardApi));
    server.get({path: '/boards/:boardId/projectCardStatistic', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardApi.getProjectCardStatistic.bind(boardApi));
	server.post({path: '/boards', version: '1.0.0'}, accessControl.ensureAuthenticated, boardApi.add.bind(boardApi));
    server.put({path: '/boards/:boardId', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardApi.update.bind(boardApi));
    server.del({path: '/boards/:boardId', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardApi.delete.bind(boardApi));
};
