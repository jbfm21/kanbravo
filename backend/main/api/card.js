'use strict';

//INTERESSANTE: Estudar http://mongoosejs.com/docs/discriminators.html para separar backlogcard, canceled card, ...

const path = require('path');
const async = require('async');
const restify = require('restify');
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');

const entityDbManager = require('../db/card');
const dbRatingType = require('../db/ratingType');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');
const handleErrors = require('../api-util/handle-errors');
const apiUtils = require('../api-util/api-utils');
const directoryManager = require('../api-util/directory-manager').CardDirectoryManager;

const AppError = require('../errors/app-error');
const FormError = require('../errors/form-error');

const ConcurrencyError = require('../errors/concurrency-error');

const enums = require('../enums');

const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const dbCard = require('../db/card');
const dbBoardMember = require('../db/boardMember');
const dbUser = require('../db/user');
const dbTask = require('../db/task');
const dbTimeSheet = require('../db/timesheet');
const dbCardIdConfig = require('../db/cardIdConfig');
const treeUtil = require('../commons/tree-util');
const momentUtil = require('../commons/moment-util');
const boardLaneApi = require('./boardLane').api;
const cardMovementHistoryApi = require('./cardMovementHistory').api;
const BoardChildEntity = new BoardChildEntityClass('boards/card', entityDbManager);

class CardLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('cardLoggerInfo', action);
    }
}

class CardApi
{

    _createDataToAddOrUpdate(req, res, entity, nextTask)  //eslint-disable-line no-unused-vars
    {
        const loggerInfo = new CardLoggerInfo('_createDataToAddOrUpdate');
        const logger = new Logger(req.log);
        const cardId = entity._id.toString();
        const boardId = entity.board.toString();

        let attachments = entity.attachments;

        //TODO: Necessario para evitar sobrescrever as referencias de impedimentos e numero de comentarios. Tais referencias sao controladas pela api de impedimentos. Ver se tem outra forma melhor
        delete entity.impediments;
        delete entity.numComments;

        let dataToLog = {boardId: boardId, cardId: cardId};


        const setAttachmentTask = (innerNextTask) =>
        {
            let files = req.files;

            if (attachments)
            {
                attachments.map(function (attachment)
                {
                    if (attachment.isNew)
                    {
                        const file = files[attachment.id];
                        const attachmentPath = directoryManager.getRelativeDir(boardId, cardId) + '/' + path.basename(file.path);
                        logger.info('Adding  file', loggerInfo.create(dataToLog, attachmentPath));
                        directoryManager.moveFromTemporaryDirectoryToAttachmentDirSync(boardId, cardId, file);
                        delete attachment.preview;
                        delete attachment.isNew;
                        attachment['name'] = file.name; //eslint-disable-line
                        attachment['lastModifiedDate'] = file.lastModifiedDate; //eslint-disable-line
                        attachment['size'] = file.size; //eslint-disable-line
                        attachment['path'] = attachmentPath; //eslint-disable-line
                        attachment.type = file.type; //eslint-disable-line
                    }
                    if (attachment.isDeleted)
                    {
                        logger.info('Removing file', loggerInfo.create(dataToLog, attachment.path));
                        directoryManager.removeFromAttachmentDirSync(boardId, cardId, attachment.path);
                    }
                });

                let filteredAttachments = attachments.filter((attachment) => !attachment.isDeleted);

                entity.attachments = filteredAttachments;
            }
            return innerNextTask(null);
        };

        const setCardIdConfigTask = (innerNextTask) => //eslint-disable-line
        {
            const removePrefixFn = (cardIdConfigEntity, externalId) =>
            {
                const externalIdStartWithPrefix = (cardIdConfigEntity && cardIdConfigEntity.prefix && entity.externalId.toLowerCase().startsWith(cardIdConfigEntity.prefix.toLowerCase()));
                if (!externalIdStartWithPrefix)
                {
                    return externalId;
                }
                const regEx = new RegExp(cardIdConfigEntity.prefix, 'i');
                return externalId.replace(regEx, '');
            };

            if ((entity.cardIdConfig) && entity.externalId)
            {
                const cardConfigId = (entity.cardIdConfig._id) ? entity.cardIdConfig._id : entity.cardIdConfig;
                dbCardIdConfig.findById(cardConfigId, (err, cardIdConfigEntity) =>
                {
                    entity.externalId = removePrefixFn(cardIdConfigEntity, entity.externalId);
                    return innerNextTask(null);
                });
            }
            else
            {
                return innerNextTask(null);
            }
        };

        const endTask = (err) =>
        {
            return nextTask(err, entity);
        };

        async.waterfall([setAttachmentTask.bind(this), setCardIdConfigTask.bind(this)], endTask.bind(this));
    }

    _appendCardData(req, res, entity, nextTask)
    {
        const getTaskStatistics = (innerNextTask) =>
        {
            dbTask.aggregate(
            [
                {$match: {card: mongoose.Types.ObjectId(req.params.id)}},
                {$group: {_id: {card: '$card', completed: '$completed'}, total: {$sum: 1}}},
                {$group: {_id: '$_id.card', statistic: {$push: {completed: '$_id.completed', total: '$total'}}, total: {$sum: '$total'}}}
            ], (err, taskStatisticsCards) =>
            {
                if (taskStatisticsCards && taskStatisticsCards.length)
                {
                    let statistic = {completed: 0, notCompleted: 0, total: taskStatisticsCards[0].total};
                    _.forEach((taskStatisticsCards[0].statistic), statisticData =>
                    {
                        statistic[statisticData.completed ? 'completed' : 'notCompleted'] += statisticData.total;
                    });
                    entity['taskStatistic'] = statistic; //eslint-disable-line
                }
                return innerNextTask(err, entity);
            });
        };

        const endTask = (err, updatedEntity) =>
        {
            return nextTask(err, updatedEntity);
        };

        async.waterfall([getTaskStatistics.bind(this)], endTask.bind(this));
    }

    findAll(req, res, next)
    {
        let options = {filter: {}, populate: []};
        if (req.params.status)
        {
            options.filter.status = {$eq: req.params.status};
            options.populate = dbCard.archiveFieldsToPopulate;
        }
        if (req.params.projectId)
        {
            options.filter.project = {$eq: req.params.projectId};
        }

        if (req.params.limit && dbCard.paginate)
        {
            options.sort = {field: 'archivedDate', direction: 'desc'};
            return this._findAllPaginatingWithCursor(req, res, next, options);
        }

        return BoardChildEntity.findAll(req, res, next, options);
    }

    _findAllPaginatingWithCursor(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            filter: null,
            appendDataFn: null,
            sort: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo(this.apiName, 'findAllWithPaginate');

        const boardId = req.params.boardId;
        const limit = req.params.limit ? Number(req.params.limit) : 10;
        let paginationOption = {};

        if (req.params.before) {paginationOption['before'] = req.params.before;} //eslint-disable-line
        if (req.params.after) {paginationOption['after'] = req.params.after;} //eslint-disable-line
        if (actualOptions.sort) {paginationOption['sort'] = actualOptions.sort.direction;} //eslint-disable-line

        let paginatedKey = (actualOptions.sort) && (actualOptions.sort.field) ? actualOptions.sort.field : '_id';

        const searchTerm = (req.params.searchTerm) ? req.params.searchTerm : (req.body) ? req.body.searchTerm : null; //eslint-disable-line

        let dataToLog = {boardId: boardId};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        const getPageTask = (nextTask) =>
        {
            let query = null;

            if (searchTerm)
            {
                const regexString = apiUtils.createSearchRegExpPatternIgnoreAccents(searchTerm);
                //const re = new RegExp(regexString, 'ig');
                query = dbCard.paginate(paginationOption, paginatedKey).where({board: boardId, title: {$regex: regexString, $options: 'i'}});
            }
            else
            {
                query = dbCard.paginate(paginationOption, paginatedKey).where({board: boardId});
            }

            if (actualOptions.filter)
            {
                query = query.where(actualOptions.filter);
            }
            query = query.limit(limit);
            if (actualOptions.populate)
            {
                query = query.populate(actualOptions.populate);
            }
            query = query.lean();
            query.execPagination(nextTask);
        };

        const getTotalElementsInDbTask = (pageResult, nextTask) =>
        {
             let query = dbCard.where({board: boardId});
             if (actualOptions.filter)
             {
                query.where(actualOptions.filter);
             }
             dbCard.count(query).exec((err, totalOfElementsInDb) => nextTask(err, pageResult, totalOfElementsInDb));
        };

        const endTask = (err, pageResult, totalOfElementsInDb) =>
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, pageResult));
            let objectToReturn = {boardId: boardId, before: pageResult.before, after: pageResult.after, total: totalOfElementsInDb, currentPage: pageResult.thisPage, limit: pageResult.perPage, data: pageResult.results};
            if (actualOptions.appendDataFn)
            {
                Object.assign(objectToReturn, actualOptions.appendDataFn(req));
            }
            return res.json(objectToReturn);
        };

        async.waterfall([getPageTask.bind(this), getTotalElementsInDbTask.bind(this)], endTask.bind(this));
    }

    findById(req, res, next)
    {
        return BoardChildEntity.findById(req, res, next, {appendDataFn: this._appendCardData, populate: dbCard.fieldsToPopulate});
    }

    searchToConnect(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('searchToConnect');

        const boardId = req.params.boardId;
        const searchFilters = apiUtils.getBodyModel(req);

        let filter = {board: mongoose.Types.ObjectId(boardId), parent: null, status: {$in: [enums.cardStatus.inboard.name, enums.cardStatus.backlog.name]}};

        const searchTerm = searchFilters.titleToSearch;
        if (searchTerm && searchTerm.trim().length > 0 && searchTerm.toLowerCase() !== '[searchall]')
        {
            const regexString = apiUtils.createSearchRegExpPattern(searchTerm);
            const re = new RegExp(regexString, 'ig');
            filter['title'] = re; //eslint-disable-line
        }
        if (searchFilters.projectId)
        {
            filter['project'] = mongoose.Types.ObjectId(searchFilters.projectId); //eslint-disable-line
        }

        logger.debug('Start', loggerInfo.create(filter, 'Start'));

        const queryCards = (nextTask) => entityDbManager.find(filter)
            .select({_id: 1, nonce: 1, title: 1, board: 1, project: 1, startPlanningDate: 1, endPlanningDate: 1, startExecutionDate: 1, endExecutionDate: 1, priorityNumberValue: 1, priority: 1, ratings: 1, metricValue: 1, metric: 1, itemSize: 1, tags: 1, childrenMetric: 1, childrenMetricValue: 1, grandChildrenCardsBasedCalculation: 1})
            .populate(
                [{path: 'ratings', select: 'id votes', populate: {path: 'ratingType', model: 'RatingType', select: '_id title avatar maxRating'}},
                 {path: 'priority', select: '_id title avatar'},
                 {path: 'project', select: '_id title avatar'},
                 {path: 'itemSize', select: '_id title avatar'},
                 {path: 'tags', select: '_id title avatar'},
                 {path: 'metric', select: '_id title avatar'},
                 {path: 'childrenMetric', select: '_id title avatar'}
                ]
        ).exec((err, cardsResult) => nextTask(err, cardsResult));

        const queryRatingTypes = (cards, nextTask) => dbRatingType.find({board: boardId}).select('_id title avatar maxRating').exec((err, ratingTypesResult) => nextTask(err, cards, ratingTypesResult));

        const endTask = (err, cards, ratingTypes) =>
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            return res.json({data: cards, ratingTypes: ratingTypes});
        };

        async.waterfall([queryCards.bind(this), queryRatingTypes.bind(this)], endTask.bind(this));
    }

    searchParentToConnect(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('searchToConnect');

        const boardId = req.params.boardId;
        const searchFilters = apiUtils.getBodyModel(req);

        let filter = {board: mongoose.Types.ObjectId(boardId), status: {$in: [enums.cardStatus.inboard.name, enums.cardStatus.backlog.name]}};

        const searchTerm = searchFilters.titleToSearch;
        if (searchTerm && searchTerm.trim().length > 0 && searchTerm.toLowerCase() !== '[searchall]')
        {
            const regexString = apiUtils.createSearchRegExpPattern(searchTerm);
            const re = new RegExp(regexString, 'ig');
            filter['title'] = re; //eslint-disable-line
        }

        logger.debug('Start', loggerInfo.create(filter, 'Start'));

        const queryCards = (nextTask) => entityDbManager.find(filter).select({_id: 1, nonce: 1, title: 1, board: 1}).exec((err, cardsResult) => nextTask(err, cardsResult));

        const endTask = (err, cards) =>
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            return res.json({data: cards});
        };

        async.waterfall([queryCards.bind(this)], endTask.bind(this));
    }

    updateData(req, res, next)
    {
        let that = this;

        let fieldsToPopulate = JSON.parse(JSON.stringify(dbCard.fieldsToPopulate)); //TODO: feito isso por conta do dashboard de conexao que necessita dessa info após atualizar a coenxao de um cartao (Pesquisar por //TODO:Necessario_01)
        fieldsToPopulate.push({path: 'board', select: '_id title'});
        return BoardChildEntity.updateData(req, res, next, {populate: fieldsToPopulate, createDataToUpdate: that._createDataToAddOrUpdate, appendDataAfterUpdateFn: this._appendCardData});
    }

    _changeCardStatusList(req, res, next, status, updateFunction)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo(`changeStatus_${status}`);

        const boardId = req.params.boardId;
        const entityId = req.params.id;
        const dataToLog = {boardId: boardId, entityId: entityId};
        const dataToQuery = {board: boardId, _id: entityId};

        let changedCardStatusCardIds = [];
        let changedCardStatusErrors = [];
        let cardsToChangeStatus = [];
        let cardStack = [];

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const _changeCardStatusEntityAux = (card, nextTask) =>
        {
            const updateEntityTask = (innerTask) =>
            {
                if (updateFunction)
                {
                    updateFunction(card);
                }
                card.status = status;
                return card.save((err) => innerTask(err));
            };

            const disconnectAllChildrenIfCanceledOrRemoved = (innerTask) =>
            {
                switch (status)
                {
                    case enums.cardStatus.canceled.name:
                    case enums.cardStatus.deleted.name:
                        return dbCard.update({parent: entityId}, {parent: null}, {multi: true}, (err) => innerTask(err));
                    default: return innerTask(null);
                }
            };

            const updateTasksTask = (innerTask) =>
            {
                dbTask.update({board: boardId, card: entityId}, {cardStatus: status}, {multi: true}, (err) => innerTask(err));
            };

            let deleteFromBoardLaneTask = (innerTask) =>
            {
                //TODO: implementar
                return innerTask(null);
            };

            const innerEndTask = (err) =>
            {
                if (!err)
                {
                    changedCardStatusCardIds.push(card._id);
                }
                else if (card)
                {
                    changedCardStatusErrors.push({error: handleErrors.convertError(res, err), id: card._id, title: card.title});
                }
                else
                {
                    //TODO: melhorar esse trecho para identificar que o problema foi na operacao de find
                    changedCardStatusErrors.push({error: handleErrors.convertError(res, err), id: '', title: '!NotFound!'});
                }
                return nextTask();
            };

            async.waterfall([updateEntityTask.bind(this), updateTasksTask.bind(this), disconnectAllChildrenIfCanceledOrRemoved.bind(this), deleteFromBoardLaneTask.bind(this)], innerEndTask.bind(this));
        };

        let getRootCard = (nextTask) =>
        {
            return entityDbManager.findOne(dataToQuery, (err, card) =>
            {
                cardsToChangeStatus.push(card);
                cardStack.push(card);
                return nextTask(err);
            });
        };

        let getCardListToChangeStatus = (nextTask) =>
        {
            const body = apiUtils.getBodyModel(req);
            if (!body.isToApplyToConnectedCardToo)
            {
                return nextTask(null);
            }
            let getAllDescendentes = () =>
            {
                if (cardStack.length === 0)
                {
                    return nextTask(null);
                }
                var currentnode = cardStack.pop();
                return entityDbManager.find({parent: currentnode._id}, (err, cards) =>
                {
                    _.forEach(cards, (item) =>
                    {
                        //Para evitar loop infinito em caso de referencia ciclica
                        if (!_.find(cardsToChangeStatus, c => c._id === item._id))
                        {
                            cardStack.push(item);
                            cardsToChangeStatus.push(item);
                        }
                    });
                    return getAllDescendentes(null);
                });
            };
            return getAllDescendentes();
        };

        let changeCardStatusList = (nextTask) =>
        {
            async.each(cardsToChangeStatus, _changeCardStatusEntityAux.bind(this), nextTask.bind(this));
        };

        let endTask = (err) =>
        {
            if (handleErrors.handleGenericError(req, res, next, logger, loggerInfo, err, cardsToChangeStatus))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, 'cencel/delete card list'));
            return res.send(200, {data: {changedCardStatusCardIds: changedCardStatusCardIds, changedCardStatusErrors: changedCardStatusErrors}});
        };

        async.waterfall([getRootCard.bind(this), getCardListToChangeStatus.bind(this), changeCardStatusList.bind(this)], endTask.bind(this));

    }

    disconnectCard(card)
    {
        card.parent = null;
    }

    cancelCard(req, res, next)
    {
        return this._changeCardStatusList(req, res, next, enums.cardStatus.canceled.name, this.disconnectCard);
    }

    deleteData(req, res, next)
    {
        return this._changeCardStatusList(req, res, next, enums.cardStatus.deleted.name, this.disconnectCard);
    }

    _changeCardStatusAux(logger, loggerInfo, boardId, entityId, status, updateFunction, endTask)
    {
        const dataToLog = {boardId: boardId, entityId: entityId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        //TODO: melhorar a performance do arquivamento, pois não é necessário carregar tudo, utilizar findAndUpdate
        const findByIdTask = (nextTask) => entityDbManager.findOne({board: boardId, _id: entityId}, nextTask);

        const updateEntityTask = (entity, nextTask) =>
        {
            if (updateFunction)
            {
                updateFunction(entity);
            }
            entity.status = status;
            entity.save((err) => nextTask(err, entity));
        };

        const disconnectAllChildrenIfCanceledOrRemoved = (card, nextTask) =>
        {
            switch (status)
            {
                case enums.cardStatus.canceled.name:
                case enums.cardStatus.deleted.name:
                    dbCard.update({parent: entityId}, {parent: null}, {multi: true}, (err) => nextTask(err, card));
                    break;
                default: nextTask(null, card);
            }
        };

        const updateTasksTask = (card, nextTask) =>
        {
            dbTask.update({board: boardId, card: entityId}, {cardStatus: status}, {multi: true}, (err) => nextTask(err, card));
        };

        let deleteFromBoardLaneTask = (card, nextTask) =>
        {
            //TODO: implementar
            return nextTask(null, card);
        };

        async.waterfall([findByIdTask.bind(this), updateEntityTask.bind(this), updateTasksTask.bind(this), disconnectAllChildrenIfCanceledOrRemoved.bind(this), deleteFromBoardLaneTask.bind(this)], endTask.bind(this));
    }

    updateCardInfoWhenArchived(card)
    {
        const createdDateMoment = moment(card.dateMetrics.createdDate);
        const startLeadTimeMoment = (card.dateMetrics.startLeadTimeDate) ? moment(card.dateMetrics.startLeadTimeDate) : null;
        const endLeadTimeMoment = (card.dateMetrics.endLeadTimeDate) ? moment(card.dateMetrics.endLeadTimeDate) : null;
        const startCycleTimeMoment = (card.dateMetrics.startCycleTimeDate) ? moment(card.dateMetrics.startCycleTimeDate) : null;
        const endCycleTimeMoment = (card.dateMetrics.endCycleTimeDate) ? moment(card.dateMetrics.endCycleTimeDate) : null;

        card.dateMetrics.customerLeadTime = (endLeadTimeMoment && createdDateMoment) ? endLeadTimeMoment.diff(createdDateMoment, 'minutes') : null; //endLadeTime - createdDate
        card.dateMetrics.leadTime = (endLeadTimeMoment && startLeadTimeMoment) ? endLeadTimeMoment.diff(startLeadTimeMoment, 'minutes') : null;//endLadeTime - startLeadTime
        card.dateMetrics.cycleTime = (endCycleTimeMoment && startCycleTimeMoment) ? endCycleTimeMoment.diff(startCycleTimeMoment, 'minutes') : null; //endCycleTimeDate - startCycleTimeDate
        card.dateMetrics.backlogTime = (startLeadTimeMoment && createdDateMoment) ? startLeadTimeMoment.diff(createdDateMoment, 'minutes') : null; //leadTime-createdTime
        card.dateMetrics.commitmentTime = (startCycleTimeMoment && startLeadTimeMoment) ? startCycleTimeMoment.diff(startLeadTimeMoment, 'minutes') : null; //cycleTime-leadTime
        card.dateMetrics.deliveryTime = (endLeadTimeMoment && endCycleTimeMoment) ? endLeadTimeMoment.diff(endCycleTimeMoment, 'minutes') : null; //leadTime-cycleTime
        card.archivedDate = moment().utc();
    }

    archiveList(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('archiveList');
        let that = this;

        const boardId = req.params.boardId;
        const cardsToBeArchived = apiUtils.getBodyModel(req);
        let changedCardStatusCardIds = [];
        let changedCardStatusErrors = [];

        const archiveCardFunction = (item, callback) =>
        {
            const changeCardStatusAuxCallback = (err, card) =>
            {
                if (!err)
                {
                    changedCardStatusCardIds.push(card._id);
                }
                else if (card)
                {
                    changedCardStatusErrors.push({error: handleErrors.convertError(res, err), id: card._id, title: card.title});
                }
                else
                {
                    //TODO: melhorar esse trecho para identificar que o problema foi na operacao de find
                    changedCardStatusErrors.push({error: handleErrors.convertError(res, err), id: '', title: '!NotFound!'});
                }
                return callback();
            };
            this._changeCardStatusAux(logger, loggerInfo, boardId, item.cardId, 'archived', this.updateCardInfoWhenArchived, changeCardStatusAuxCallback.bind(that));
        };

        let endTask = (err) =>
        {
            if (handleErrors.handleGenericError(req, res, next, logger, loggerInfo, err, cardsToBeArchived))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(cardsToBeArchived, 'Archived card list'));
            return res.send(200, {data: {changedCardStatusCardIds: changedCardStatusCardIds, changedCardStatusErrors: changedCardStatusErrors}});
        };
        async.each(cardsToBeArchived, archiveCardFunction.bind(this), endTask.bind(this));
    }

    _changeCardStatus(req, res, next, status, updateFunction)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo(`changeStatus_${status}`);

        const boardId = req.params.boardId;
        const entityId = req.params.id;
        const dataToLog = {boardId: boardId, entityId: entityId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        let endTask = (err, savedEntity) =>
        {
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, dbCard, entityId, {_id: entityId}, savedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, savedEntity));
                return res.send(200, {data: {entityId: entityId}});
            });
        };

        return this._changeCardStatusAux(logger, loggerInfo, boardId, entityId, status, updateFunction, endTask);
    }

    archiveCard(req, res, next)
    {
        return this._changeCardStatus(req, res, next, 'archived', this.updateCardInfoWhenArchived);
    }

    _saveWorkedOnCardDateTimeInTimesheet(userId, userDataBeforeUpdate, member, nextTask)
    {
        const originalWorkOnCard = userDataBeforeUpdate.workOnCard;
        if (!originalWorkOnCard || originalWorkOnCard.board === null || originalWorkOnCard.card === null)
        {
            return nextTask(null, userDataBeforeUpdate, originalWorkOnCard, null);
        }
        const startDateMoment = moment(originalWorkOnCard.startDateTime);
        const now = moment();

        const splittedInterval = momentUtil.splitMomentDateRange(startDateMoment, now);

        let timeSheetsDocs = [];
        for (let item of splittedInterval)
        {
            const durationInMinutes = item.endDateTime.diff(item.startDateTime, 'minutes');
            //so limita a hora de trabalho caso tenha o intervalo tenha ultrapasado a um dia
            const workingHour = (((member.hourPerDay * 60) < durationInMinutes) && splittedInterval.length > 1) ? member.hourPerDay * 60 : durationInMinutes;
            let timesheet = new dbTimeSheet({
                board: originalWorkOnCard.board, card: originalWorkOnCard.card, user: userId,
                startDate: new Date(Date.UTC(item.startDateTime.year(), item.startDateTime.month(), item.startDateTime.date(), 0, 0, 0)),
                minutes: workingHour,
                trackerStartDate: item.startDateTime.toDate(),
                trackerEndDate: item.endDateTime.toDate(),
                trackerMinutes: durationInMinutes
            });
            timeSheetsDocs.push(timesheet.toObject());
        }

        return dbTimeSheet.collection.insert(timeSheetsDocs, (err, savedTimeSheetDocs) => {return nextTask(err, userDataBeforeUpdate, originalWorkOnCard, savedTimeSheetDocs.ops);});
    }

    _setWorkOnCard(req, res, next, workOnCardInfo)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('setWorkOnCard');

        const boardId = req.params.boardId;
        const cardId = req.params.id;

        const user = apiUtils.getBodyModel(req);
        const userId = user._id;
        const nonce = user.nonce;

        const dataToLog = {boardId: boardId, cardId: cardId, userId: userId, workOnCard: workOnCardInfo};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        const assignUserQuery = dbUser.findOneAndUpdate({_id: userId}, {nonce: nonce, workOnCard: workOnCardInfo});

        const checkIfBoardMemberTask = (nextTask) => accessControl.ensureBoardBelongToUser(req, res, nextTask, {userId: userId});

        const getMemberTask = (nextTask) => dbBoardMember.findOneWithoutDeleted({user: userId, board: boardId}, nextTask);

        const assignUserTask = (member, nextTask) => assignUserQuery.exec((err, userDataBeforeUpdate) => //eslint-disable-line
        {
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, dbUser, userId, {_id: userId}, userDataBeforeUpdate, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                return nextTask(err, userDataBeforeUpdate, member);
            });
        });

        const saveDataInTimeSheetTask = (userDataBeforeUpdate, member, nextTask) => this._saveWorkedOnCardDateTimeInTimesheet(userId, userDataBeforeUpdate, member, nextTask);

        const getUserAfterUpdateTask = (userDataBeforeUpdate, originalWorkOnCard, savedTimesheet, nextTask) => dbUser.findById(userId, (err, userDataAfterUpdate) => nextTask(err, userDataBeforeUpdate, originalWorkOnCard, savedTimesheet, userDataAfterUpdate));

        const endTask = (err, userDataBeforeUpdate, originalWorkOnCard, savedTimeSheetDocs, userDataAfterUpdate) => //eslint-disable-line
        {
            if (err)
            {
                if ((err instanceof AppError) || (err instanceof restify.errors.ResourceNotFoundError) || (err instanceof ConcurrencyError))
                {
                    return next(err);
                }
                logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
                return next(new AppError(res.__('INVALID_REQUEST')));
            }
            logger.info('Success', loggerInfo.create(dataToLog, `id: ${userDataBeforeUpdate._id}`));
            return res.send(201, {data: {user: {_id: userId, nonce: userDataAfterUpdate.nonce}, cardId: cardId, workOnCard: workOnCardInfo, savedTimeSheetDocs: savedTimeSheetDocs}});
        };

        async.waterfall([checkIfBoardMemberTask.bind(this), getMemberTask.bind(this), assignUserTask.bind(this), saveDataInTimeSheetTask.bind(this), getUserAfterUpdateTask.bind(this)], endTask.bind(this)); //eslint-disable-line consistent-return
    }

    setWorkOnCardUser(req, res, next)
    {
        const boardId = req.params.boardId;
        const cardId = req.params.id;
        const newWorkOnCard = {board: boardId, card: cardId, startDateTime: moment()};
        return this._setWorkOnCard(req, res, next, newWorkOnCard);
    }

    setNotWorkOnCardUser(req, res, next)
    {
        const newWorkOnCard = {board: null, card: null, startDateTime: null};
        return this._setWorkOnCard(req, res, next, newWorkOnCard);
    }

    setDefaultPropertiesInCardWhenAdd(req, cardToSave)
    {
        cardToSave.board = req.params.boardId;
        cardToSave.creator = (req.user) ? req.user._id : null;
    }

    //TODO: está realizando o popualte de todos os cartões, verificar se é necessário
    getChildrenConnections(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('setWorkOnCard');

        const boardId = req.params.boardId;
        const cardId = req.params.id;

        const dataToLog = {boardId: boardId, cardId: cardId};
        const lstCardPopulateFields = dbCard.fieldsToPopulate;

        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        const getCard = (nextTask) =>
        {
            return entityDbManager.findOne({board: boardId, _id: cardId}).select('grandChildrenCardsBasedCalculation').lean().exec((err, result) => nextTask(err, result));
        };

        const getConnectionsTask = (cardParameters, nextTask) =>
        {
            //TODO: Reduzir a quantidade de campos retornados
            let query = entityDbManager.find({parent: cardId}).select('-description').lean();
            if (lstCardPopulateFields)
            {
                for (let fieldToPopulate of lstCardPopulateFields) //eslint-disable-line
                {
                    query.populate(fieldToPopulate);
                }
            }
            query.populate({path: 'board', select: '_id title'});
            query.exec((err, result) => nextTask(err, cardParameters, result));
        };

        const getChildreOfConnectionsTask = (cardParameter, connections, nextTask) =>
        {
            if (!cardParameter || !cardParameter.grandChildrenCardsBasedCalculation)
            {
                return nextTask(null, connections, null);
            }
            let ids = connections.map(item => mongoose.Types.ObjectId(item._id));
            let query = entityDbManager.find({parent: {$in: ids}}).select('-description').lean();
            if (lstCardPopulateFields)
            {
                for (let fieldToPopulate of lstCardPopulateFields) //eslint-disable-line
                {
                    if (fieldToPopulate.path !== 'parent')
                    {
                        query.populate(fieldToPopulate);
                    }
                }
            }
            query.populate({path: 'board', select: '_id title'});
            return query.exec((err, result) => nextTask(err, connections, result));
        };

        const endTask = (err, connections, childOfConnections) =>
        {
            if (childOfConnections)
            {
                let childConnectionGroupByParent = _.groupBy(childOfConnections, 'parent');
                for (let connection of connections)
                {
                    connection.children = childConnectionGroupByParent[connection._id];
                }
                if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
                {
                    return null;
                }
            }
            logger.info('Success', loggerInfo.create(dataToLog, connections));
            return res.json({data: connections});
        };
        async.waterfall([getCard.bind(this), getConnectionsTask.bind(this), getChildreOfConnectionsTask.bind(this)], endTask.bind(this));
   }

    addCardInBackLog(req, res, next) //eslint-disable-line consistent-return
    {
        const that = this;
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('_addCardInBackLog');

        const boardId = req.params.boardId;
        const cardToAdd = apiUtils.getBodyModel(req);
        const dataToLog = {boardId: boardId, cardToAdd: cardToAdd};

        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        if (!cardToAdd)
        {
            return next(new AppError(res.__('INVALID_REQUEST')));
        }

        const createCard = (nextTask) =>
        {
            let cardToSave = new dbCard(cardToAdd);
            cardToSave.status = enums.cardStatus.backlog.name;
            that.setDefaultPropertiesInCardWhenAdd(req, cardToSave);
            that._createDataToAddOrUpdate(req, res, cardToSave, (err, changedCardToSave) =>
            {
                if (err)
                {
                    return nextTask(err);
                }
                let validationError = cardToSave.validateSync();
                if (validationError)
                {
                    logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
                    return nextTask(new FormError(validationError.errors));
                }
                return changedCardToSave.save((err, savedCard, numAffected) => nextTask(err, savedCard)); //eslint-disable-line
            });

        };

        const getCard = (savedCard, nextTask) =>
        {
            const lstCardPopulateFields = dbCard.fieldsToPopulate;
            let query = dbCard.findById(savedCard._id)
            .select('-description');
            if (lstCardPopulateFields)
            {
                for (let fieldToPopulate of lstCardPopulateFields) //eslint-disable-line
                {
                    query.populate(fieldToPopulate);
                }
            }
            query.lean().where('_id').equals(savedCard._id).exec((err, savedCardWithPopulatedFields) => nextTask(err, savedCardWithPopulatedFields));
        };

        const endTask = (err, savedCard) => //eslint-disable-line no-unused-vars
        {
            if (handleErrors.handleAddError(req, res, next, logger, loggerInfo, err, dataToLog, cardToAdd, savedCard))
            {
                //TODO: realizasr rolback
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, `id: ${savedCard._id}`));
            return res.send(201, {data: {savedCard: savedCard}});
        };

        async.waterfall([createCard.bind(this), getCard.bind(this)], endTask.bind(this)); //eslint-disable-line consistent-return
    }

    addCardInFirstLeafLane(req, res, next) //eslint-disable-line consistent-return
    {
        const that = this;
        const logger = new Logger(req.log);
        const loggerInfo = new CardLoggerInfo('addCardInFirstLeafLane');

        const boardId = req.params.boardId;
        const body = apiUtils.getBodyModel(req);
        const cardToAdd = body.card;
        const position = body.position; //(firstLaneInit ou firstLaneEnd) //TODO: colocar em uma enumeracao
        const dataToLog = {boardId: boardId, cardToAdd: cardToAdd};

        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        if (!cardToAdd)
        {
            return next(new AppError(res.__('INVALID_REQUEST')));
        }

        const getBoardLaneToUpdate = (nextTask) => boardLaneApi.getBoardLaneToUpdate(req, res, nextTask, true);

        const createCard = (boardLaneTree, nextTask) =>
        {
            let cardToSave = new dbCard(cardToAdd);
            cardToSave.status = enums.cardStatus.inboard.name;

            that.setDefaultPropertiesInCardWhenAdd(req, cardToSave);
            that._createDataToAddOrUpdate(req, res, cardToSave, (err, changedCardToSave) =>
            {
                if (err)
                {
                    return nextTask(err);
                }
                let validationError = cardToSave.validateSync();
                if (validationError)
                {
                    logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
                    return nextTask(new FormError(validationError.errors));
                }
                return changedCardToSave.save((err, savedCard, numAffected) => nextTask(err, boardLaneTree, savedCard)); //eslint-disable-line
            });
        };

        const attachCardToLane = (boardLaneTree, savedCard, nextTask) =>
        {
            const firstLeafLane = treeUtil.getFirstLeaf(boardLaneTree.rootNode);
            if (!firstLeafLane.cards)
            {
                firstLeafLane.cards = [];
            }
            //TODO: colocar em enumeracao
            switch (position)
            {
                case 'firstLaneInit':
                    firstLeafLane.cards.unshift(savedCard._id);
                    break;
                case 'firstLaneEnd':
                    firstLeafLane.cards.push(savedCard._id);
                    break;
                default:
                    firstLeafLane.cards.push(savedCard._id);
                    break;
            }

            boardLaneTree.save((err) =>{nextTask(err, boardLaneTree, firstLeafLane, savedCard);});
        };

        const saveMovementActionHistoryTask = (boardLaneTree, firstLeafLane, savedCard, nextTask) =>
        {
            return cardMovementHistoryApi.saveMovementActionHistoryTask(savedCard.dateMetrics.createdDate, savedCard, firstLeafLane, (err, card) => nextTask(err, boardLaneTree, firstLeafLane, card));
        };

        const getCard = (boardLaneTree, firstLeafLane, savedCard, nextTask) =>
        {
            const lstCardPopulateFields = dbCard.fieldsToPopulate;
            let query = dbCard.findById(savedCard._id)
            .select('-description');
            if (lstCardPopulateFields)
            {
                for (let fieldToPopulate of lstCardPopulateFields) //eslint-disable-line
                {
                    query.populate(fieldToPopulate);
                }
            }
            query.lean().where('_id').equals(savedCard._id).exec((err, savedCardWithPopulatedFields) => nextTask(err, boardLaneTree, firstLeafLane, savedCardWithPopulatedFields));
        };

        const endTask = (err, boardLaneTree, firstLeafLane, savedCard) => //eslint-disable-line no-unused-vars
        {
            if (handleErrors.handleAddError(req, res, next, logger, loggerInfo, err, dataToLog, cardToAdd, savedCard))
            {
                //TODO: realizar rolback
                return null;
            }
            if (!firstLeafLane)
            {
                //TODO: realizar rollback
                logger.error('Conflict Update', loggerInfo.create(dataToLog, 'Conflict Update'));
                return next(new ConcurrencyError(firstLeafLane));
            }
            logger.info('Success', loggerInfo.create(dataToLog, `id: ${firstLeafLane._id}`));
            return res.send(201, {data: {laneId: firstLeafLane._id, savedCard: savedCard, position: position}});
        };
        async.waterfall([getBoardLaneToUpdate.bind(this), createCard.bind(this), attachCardToLane.bind(this), saveMovementActionHistoryTask.bind(this), getCard.bind(this)], endTask.bind(this)); //eslint-disable-line consistent-return
    }
}
const cardApi = new CardApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.findAll.bind(cardApi));

    server.post({path: '/boards/:boardId/cards/actions/archiveList', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.archiveList.bind(cardApi));
    server.post({path: '/boards/:boardId/cards/actions/searchToConnect', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.searchToConnect.bind(cardApi));
    server.post({path: '/boards/:boardId/cards/actions/searchParentToConnect', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.searchParentToConnect.bind(cardApi));

    server.post({path: '/boards/:boardId/cards/:id/actions/userWorkOn', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.setWorkOnCardUser.bind(cardApi));
    server.post({path: '/boards/:boardId/cards/:id/actions/userNotWorkOn', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.setNotWorkOnCardUser.bind(cardApi));
    server.post({path: '/boards/:boardId/cards/:id/actions/archive', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.archiveCard.bind(cardApi));
    server.post({path: '/boards/:boardId/cards/:id/actions/cancel', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.cancelCard.bind(cardApi));

    server.post({path: '/boards/:boardId/cards/actions/addInBacklog', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.addCardInBackLog.bind(cardApi));
    server.post({path: '/boards/:boardId/cards/actions/addInFirstLeafLane', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.addCardInFirstLeafLane.bind(cardApi));
    server.get({path: '/boards/:boardId/cards/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.findById.bind(cardApi));
    server.put({path: '/boards/:boardId/cards/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.updateData.bind(cardApi));
    server.del({path: '/boards/:boardId/cards/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.deleteData.bind(cardApi));

    server.get({path: '/boards/:boardId/cards/:id/childrenConnections', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardApi.getChildrenConnections.bind(cardApi));

};

module.exports.api = new CardApi();
