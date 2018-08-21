'use strict';

const async = require('async');
const _ = require('lodash');
const updateAddOns = require('react-addons-update');
const mongoose = require('mongoose');
const moment = require('moment');

const db = require('../db/index');
const enums = require('../enums/index');
const errors = require('../errors/index');
const commonUtils = require('../commons/index');
const services = require('../services/index');
const Logger = require('../logger/index').logger;
const AbstractLoggerInfo = require('../logger/index').loggerInfo;
const boardConfigApi = require('./boardConfig').api;

const accessControl = require('../api-util/access-control');
const ApiUtils = require('../api-util/api-utils');
const handleErrors = require('../api-util/handle-errors');

const emptyHorizontalLane = {laneType: null, title: '<Titulo>', cardsWide: 1, orientation: 0, wipLimit: 0, children: [], cards: []};
const emptyVerticalLane = {laneType: null, title: '<Titulo>', cardsWide: 1, orientation: 1, wipLimit: 0, children: [], cards: []};

const cardMovementHistoryApi = require('./cardMovementHistory').api;

class BoardLaneApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('BoardLanetApi', action);
    }
}

class BoardLaneApi
{
    constructor()
    {
    }

    _getCardWides(node)
    {
        if (!node.children || node.children.length === 0)
        {
            return node.cardsWide;
        }
        let sum = 0;
        for (let f in node.children) //eslint-disable-line
        {
            //TODO: Criar enumeracao para raia horizontal ou vertical
            if (node.children[f].orientation === 0) //se for horizontal soma os valores
            {
                sum += this._getCardWides(node.children[f]);
            }
            if (node.children[f].orientation === 1) //se for vertical pega o maior tamanho de cartoes das raias filhas
            {
                let childCardsWide = this._getCardWides(node.children[f]);
                if (childCardsWide > sum)
                {
                    sum = childCardsWide;
                }
            }
        }
        return sum;
    }

    _addTreeField(node, depth, parentPath, pathStr, cardsHashmap)
    {
        node['path'] = parentPath.replace(',,', ','); //eslint-disable-line
        node['pathStr'] = pathStr.replace('//', '/'); //eslint-disable-line
        node['depth'] = depth; //eslint-disable-line
        node['cardsWide'] = this._getCardWides(node); //eslint-disable-line

        if (node.cards && node.cards.length > 0)
        {
            for (let index in node.cards) //eslint-disable-line
            {
                let cardId = node.cards[index];
                let card = cardsHashmap[cardId.toString()];
                node.cards[index] = (card) ? card : {deleted: true};
            }
            //Remove os cartoes removidos que ainda nao foram removidos do objeto boardLane
            _.remove(node.cards, {deleted: true});
        }

        for (let f in node.children) //eslint-disable-line
        {
            this._addTreeField(node.children[f], depth + 1, node['path'] + ',' + node._id, node['pathStr'] + '/' + node.children[f].title, cardsHashmap); //eslint-disable-line
        }
    }

    getBoardLaneToUpdate(req, res, next, returnWithNextCallBack)
    {
        const loggerInfo = new BoardLaneApiLoggerInfo('getBoardLane');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getRootBoardLaneTask = (nextTask) => db.boardLane.findOne({board: boardId}).exec(nextTask);

        const endTask = (err, boardLaneTreeFormat) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, boardLaneTreeFormat));
            if (returnWithNextCallBack)
            {
                return next(null, boardLaneTreeFormat);
            }
            return res.json({data: boardLaneTreeFormat});
        };
        async.waterfall([getRootBoardLaneTask.bind(this)], endTask.bind(this));
    }

    getBoardLane(req, res, next, returnWithNextCallBack)
    {
        const that = this;
        const loggerInfo = new BoardLaneApiLoggerInfo('getBoardLane');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};
        const lstCardPopulateFields = db.card.fieldsToPopulate;

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getRootBoardLaneTask = (nextTask) => db.boardLane.findOne({board: boardId}).lean().exec(nextTask);

        const getCardsTask = (boardLaneTree, nextTask) =>
        {
            let query = db.card.find({board: boardId, status: enums.cardStatus.inboard.name}).select('-description');
            if (lstCardPopulateFields)
            {
                for (let index in lstCardPopulateFields) //eslint-disable-line
                {
                    query.populate(lstCardPopulateFields[index]);
                }
            }
            query.lean().exec((err, cards) =>
            {
                var cardsHashmap = _.fromPairs(cards.map((item) => [item._id.toString(), item]));
                return nextTask(err, boardLaneTree, cardsHashmap);
            });
        };

        const getTrackerIntegrationCards = (boardLaneTree, cardsHashmap, outerNextTask) =>
        {
            let externalTrackerCards = [];
            let leafNodesHash = commonUtils.treeUtil.getLeafNodesHash(boardLaneTree.rootNode);
            const getTrackerIntegrations = (innerNextTask) => db.trackerIntegration.find({board: boardId, isActive: true}).lean().exec(innerNextTask);

            const getBoardConfigs = (trackerIntegrations, innerNextTask) =>
            {
                if (!trackerIntegrations || trackerIntegrations.length <= 0)
                {
                    return outerNextTask(null, boardLaneTree, cardsHashmap);
                }
                return boardConfigApi.getAllConfigs(req, res, (err, boardConfigs) => innerNextTask(err, trackerIntegrations, boardConfigs), true, true, db.card.fieldsToProject);
            };

            const getExternalCards = (trackerIntegrations, boardConfigs, innerNextTask) =>
            {
                const _getEachTrackerCards = (trackerIntegration, eachNextTask) =>
                {
                    let finishedLoadCards = (err, cards) =>
                    {
                        if (err)
                        {
                            //TODO: informar que não conseguiu carregar os cartõex externos, mas não travar o processo
                            let errorDataToLog = {url: trackerIntegration.queryUrl, board: trackerIntegration.board, type: trackerIntegration.integrationType};
                            logger.exception(err, 'Error loading cards from external tracker', loggerInfo.create(errorDataToLog, 'Exception'));
                        }
                        else if (cards && cards.length > 0)
                        {
                            externalTrackerCards.push.apply(externalTrackerCards, cards);
                        }
                        return eachNextTask();
                    };
                    let trackerService = new services.trackerService(trackerIntegration, leafNodesHash, boardConfigs);
                    trackerService.listCards(finishedLoadCards);
                };

                const _endGetAllTrackerCards = (err) =>
                {
                     if (err)
                     {
                        return innerNextTask(err);
                     }
                     return innerNextTask(null);
                };
                return async.each(trackerIntegrations, _getEachTrackerCards.bind(this), _endGetAllTrackerCards.bind(this));
            };

            const endTask = (err) =>
            {
                if (err)
                {
                    logger.exception(err, 'Error loading cards from external tracker', loggerInfo.create({}, 'Exception'));
                    return outerNextTask(null, boardLaneTree, cardsHashmap);
                }
                if (externalTrackerCards)
                {
                    _.forEach(externalTrackerCards, (card) => {cardsHashmap[card._id] = card;});
                }
                return outerNextTask(null, boardLaneTree, cardsHashmap);
            };

            async.waterfall([getTrackerIntegrations.bind(this), getBoardConfigs.bind(this), getExternalCards.bind(this)], endTask.bind(this));
        };

        const getTaskStatisticsTask = (boardLaneTree, cardsHashmap, nextTask) =>
        {
             db.task.aggregate(
                [
                    {$match: {board: mongoose.Types.ObjectId(boardId), cardStatus: enums.cardStatus.inboard.name}},
                    {$group: {_id: {card: '$card', completed: '$completed'}, total: {$sum: 1}}},
                    {$group: {_id: '$_id.card', statistic: {$push: {completed: '$_id.completed', total: '$total'}}, total: {$sum: '$total'}}}
                ], (err, taskStatisticsCards) =>
                {
                    //Desnomraliza colocando no formato {completed: 0, notCompleted: 0, total: 0};
                    //TODO: otimizars isso, verificar se tem como fazer em uma query só essa formatacao
                    _.forEach((taskStatisticsCards), cardTaskStatistic =>
                    {
                        let card = cardsHashmap[cardTaskStatistic._id.toString()];
                        if (card)
                        {
                            let statistic = {completed: 0, notCompleted: 0, total: cardTaskStatistic.total};
                            _.forEach((cardTaskStatistic.statistic), statisticData =>
                            {
                                statistic[statisticData.completed ? 'completed' : 'notCompleted'] += statisticData.total;
                            });
                            card['taskStatistic'] = statistic; //eslint-disable-line
                        }
                    });
                    return nextTask(err, boardLaneTree, cardsHashmap);
                });
        };

        const addPathFieldTask = (boardLaneTree, cardsHashmap, nextTask) =>
        {
            that._addTreeField(boardLaneTree.rootNode, 0, ',', '/', cardsHashmap);
            return nextTask(null, boardLaneTree);
        };

        let endTask = (err, boardLaneTree) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, boardLaneTree));
            if (returnWithNextCallBack)
            {
                return next(null, boardLaneTree);
            }
            return res.json({data: boardLaneTree});
        };
        async.waterfall([getRootBoardLaneTask.bind(this), getCardsTask.bind(this), getTrackerIntegrationCards.bind(this), getTaskStatisticsTask.bind(this), addPathFieldTask.bind(this)], endTask.bind(this));
    }

    updateLayout(req, res, next)
    {
        let dataToUpdate = ApiUtils.getBodyModel(req);
        this._update(req, res, next, 'updateAllEntity', dataToUpdate);
    }

    moveCard(socketIO, req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new BoardLaneApiLoggerInfo('moveCard');
        const now = moment();

        //TODO: OTIMIZAR PARA NAO RECEBER TODO O LAYOUT COM TODAS AS INFORMAÇÕES DOS CARTOES, BASTA RECEBER O NONCE DO LAYOUT COM DAS RAIAS QUE MUDARAM COM OS IDENTIFICADORES DO CARTÃO, PARA OTIMIZAR
        //TODO: TRAFEGO DE REDE
        const layoutId = req.params.layoutId;
        const boardId = req.params.boardId;

        const data = ApiUtils.getBodyModel(req);
        const movementAction = data.movementAction;
        let dataToUpdate = data.boardLane;

        const laneChanged = movementAction.fromLane.toString() !== movementAction.toLane.toString();

        const dataToLog = {boardId: boardId, entityId: layoutId, dataToUpdate: dataToUpdate};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        if (!dataToUpdate)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new errors.appError(res.__('INVALID_REQUEST')));
        }

        dataToUpdate.board = boardId;
        dataToUpdate = ApiUtils.removeExternalCards(dataToUpdate);

        let entityToSave = new db.boardLane(dataToUpdate);

        const validationError = entityToSave.validateSync();
        if (validationError)
        {
            logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
            return next(new errors.formError(validationError.errors));
        }

        let updateQuery = db.boardLane.findOneAndUpdate({_id: layoutId, board: boardId}, dataToUpdate, {new: true}).lean();

        const getCardTask = (nextTask) => db.card.findOne({_id: movementAction.cardId, board: boardId}).exec(nextTask);

        const updateEntityTask = (card, nextTask) => updateQuery.exec((err, updatedBoardLayout) => nextTask(err, card, updatedBoardLayout));

        const updateCardDatesTask = (card, updatedBoardLayout, nextTask) =>
        {
            if (!updatedBoardLayout)
            {
                handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, null, dataToLog, db.boardLane, layoutId, null, updatedBoardLayout, (isErrorHandled) => null); //eslint-disable-line
                return null;
            }

            let targetLane = commonUtils.treeUtil.getNodeById(updatedBoardLayout.rootNode, movementAction.toLane.toString(), {addParentReference: true});
            let laneDateMetricConfig = targetLane.dateMetricConfig;
            let setDateMetricConfig = (node) =>
            {
                _.forOwn(laneDateMetricConfig, function(value, key)
                {
                    laneDateMetricConfig[key] = laneDateMetricConfig[key] || node.dateMetricConfig[key];
                });
            };

            commonUtils.treeUtil.transverseLeafNodeToParentAndDoAction(targetLane, setDateMetricConfig.bind(this));

            let isCardChanged = false;
            if (laneChanged)
            {
                isCardChanged = true;
                card.dateMetrics.lastLaneTransactionDate = now;
            }

            if (laneDateMetricConfig.isStartLeadTime && !card.dateMetrics.startLeadTimeDate)
            {
                isCardChanged = true;
                card.dateMetrics.startLeadTimeDate = now;
            }
            if (laneDateMetricConfig.isStartCycleTime && !card.dateMetrics.startCycleTimeDate)
            {
                isCardChanged = true;
                card.dateMetrics.startCycleTimeDate = now;
                if (!card.dateMetrics.startLeadTimeDate) {card.dateMetrics.startLeadTimeDate = now;}
            }
            if (laneDateMetricConfig.isEndCycleTime && !card.dateMetrics.endCycleTimeDate)
            {
                isCardChanged = true;
                card.dateMetrics.endCycleTimeDate = now;
                if (!card.dateMetrics.startCycleTimeDate) {card.dateMetrics.startCycleTimeDate = now;}
                if (!card.dateMetrics.startLeadTimeDate) {card.dateMetrics.startLeadTimeDate = now;}
            }
            if (laneDateMetricConfig.isEndLeadTime && !card.dateMetrics.endLeadTimeDate)
            {
                isCardChanged = true;
                card.dateMetrics.endLeadTimeDate = now;
                if (!card.dateMetrics.startCycleTimeDate) {card.dateMetrics.startCycleTimeDate = now;}
                if (!card.dateMetrics.endCycleTimeDate) {card.dateMetrics.endCycleTimeDate = now;}
                if (!card.dateMetrics.startLeadTimeDate) {card.dateMetrics.startLeadTimeDate = now;}
            }

            if (!card.startExecutionDate && !card.endExecutionDate && targetLane.laneType === enums.laneType.inprogress.name)
            {
                isCardChanged = true;
                card.startExecutionDate = now;
            }

            if (!card.endExecutionDate && targetLane.laneType === enums.laneType.completed.name)
            {
                isCardChanged = true;
                //Caso termine sem iniciar, coloca a data de inicio como a data de fim
                if (!card.startExecutionDate)
                {
                    card.startExecutionDate = now;
                }
                card.endExecutionDate = now;
            }

            if (isCardChanged)
            {
                return card.save((err, savedCard) => nextTask(err, savedCard, targetLane, updatedBoardLayout));
            }

            return nextTask(null, card, targetLane, updatedBoardLayout);
        };

        const saveMovementActionHistoryTask = (card, targetLane, updatedBoardLayout, nextTask) =>
        {
            if (laneChanged)
            {
                return cardMovementHistoryApi.saveMovementActionHistoryTask(now, card, targetLane, (err, innerCard) => nextTask(err, innerCard, updatedBoardLayout));
            }
            return nextTask(null, card, updatedBoardLayout);
        };

        const endTask = (err, savedCard, updatedEntity) =>
        {
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, db.boardLane, layoutId, entityToSave, updatedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, `id: ${updatedEntity._id}`));
                socketIO.to(updatedEntity.board.toString()).emit('refresh:board');
                /*socketIO.of('/').in(updatedEntity.board.toString()).clients(function (error, clients)
                {
                    //console.log('*************************');
                    if (error) { throw error; }
                    //clients.map(c => {console.log('cliente', c);});
                    return clients;
                });*/
                return res.send(201, {data: {newNonce: updatedEntity.nonce, savedCardId: savedCard._id, savedDateMetrics: savedCard.dateMetrics, targetLaneId: movementAction.toLane.toString()}});
            });
        };

        return async.waterfall([getCardTask.bind(this), updateEntityTask.bind(this), updateCardDatesTask.bind(this), saveMovementActionHistoryTask.bind(this)], endTask.bind(this));
    }

    moveLeft(req, res, next)
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            let sourceLaneIndex = _.indexOf(parentNode.children, lane);
            if (sourceLaneIndex > 0)
            {
                let targetLaneIndex = sourceLaneIndex - 1;
                parentNode.children = updateAddOns(parentNode.children, {$splice: [[sourceLaneIndex, 1], [targetLaneIndex, 0, lane]]});
            }
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'moveLeft', fn);
    }

    moveRight(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            let sourceLaneIndex = _.indexOf(parentNode.children, lane);
            if (sourceLaneIndex < parentNode.children.length - 1)
            {
                let targetLaneIndex = sourceLaneIndex + 1;
                parentNode.children = updateAddOns(parentNode.children, {$splice: [[sourceLaneIndex, 1], [targetLaneIndex, 0, lane]]});
            }
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'moveRight', fn);
    }

    addTopLaneAtTheEnd(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) => //eslint-disable-line
        {
            layoutToUpdate.rootNode.children.push(emptyHorizontalLane);
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'addTopLaneAtTheEnd', fn);
    }

    addChild(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            if (lane.children && lane.children.length > 0)
            {
                let firstLane = lane.children[0];
                let isFirstLaneHorizontalOrientation = firstLane.orientation === 0;
                if (isFirstLaneHorizontalOrientation) {lane.children.push(emptyHorizontalLane);}
                else {lane.children.push(emptyVerticalLane);}
            }
            else
            {
                lane.children.push(emptyHorizontalLane);
            }
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'addChild', fn);
    }

    clone(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            let clonedLane = JSON.parse(JSON.stringify(lane));

            commonUtils.treeUtil.transverseAllNodesAndDoAction(clonedLane, (node) =>
            {
                delete node._id;
                node.cards = [];
            });
            parentNode.children.push(clonedLane);

            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'cloneLane', fn);
    }

    deleteLane(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            //TODO (ESTATISTICA): Para estatistica eh necessario movimentar os dados tambem
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            if (parentNode.children.length > 1 && lane.cards && lane.cards.length > 0)
            {
                return next(new errors.appError(res.__('CANT_DELETE_LANE_HAVE_CARDS')));
            }
            if (parentNode.children.length === 1)
            {
                //Se só tiver uma raia, move os cartões para o pai
                parentNode.cards = [];
                parentNode.cards = parentNode.cards.concat(lane.cards);
            }
            let sourceLaneIndex = _.indexOf(parentNode.children, lane);
            parentNode.children.splice(sourceLaneIndex, 1);
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'deleteLane', fn);
    }

    splitLaneHorizontal(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            //TODO (ESTATISTICA): Para estatistica eh necessario movimentar os dados tambem
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            let firstHorizontalLane = JSON.parse(JSON.stringify(emptyHorizontalLane));
            firstHorizontalLane.cards = firstHorizontalLane.cards.concat(lane.cards);
            lane.cards = [];
            lane.children.push(firstHorizontalLane);
            lane.children.push(emptyHorizontalLane);
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'splitLaneHorizontal', fn);
    }

    splitLaneVertical(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            //TODO (ESTATISTICA): Para estatistica eh necessario movimentar os dados tambem
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            let firstVerticalLane = JSON.parse(JSON.stringify(emptyVerticalLane));
            firstVerticalLane.cards = firstVerticalLane.cards.concat(lane.cards);
            lane.cards = [];
            lane.children.push(firstVerticalLane);
            lane.children.push(emptyVerticalLane);
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'splitLaneVertical', fn);
    }

    increaseCardWide(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            lane.cardsWide++;
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'increaseCardWide', fn);
    }

    decreaseCardWide(req, res, next) //eslint-disable-line
    {
        let fn = (layoutToUpdate, lanePath, laneId) =>
        {
            let parentNode = this._getParentByPath(layoutToUpdate.rootNode, lanePath);
            let lane = _.find(parentNode.children, {_id: mongoose.Types.ObjectId(laneId)});
            if (lane.cardsWide > 1)
            {
                lane.cardsWide--;
            }
            return layoutToUpdate;
        };
        this._executeLayoutAction(req, res, next, 'decreaseCardWide', fn);
    }

    _update (req, res, next, action, dataToUpdate)
    {
        const that = this;
        const logger = new Logger(req.log);
        const loggerInfo = new BoardLaneApiLoggerInfo('updateLayout-' + action);
        const lstCardPopulateFields = db.card.fieldsToPopulate;

        const layoutId = req.params.layoutId;
        const boardId = req.params.boardId;

        const dataToLog = {boardId: boardId, entityId: layoutId, dataToUpdate: dataToUpdate};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        if (!dataToUpdate)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new errors.appError(res.__('INVALID_REQUEST')));
        }

        dataToUpdate.board = boardId;

        let entityToSave = new db.boardLane(dataToUpdate);

        const validationError = entityToSave.validateSync();
        if (validationError)
        {
            logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
            return next(new errors.formError(validationError.errors));
        }

        const updateQuery = db.boardLane.findOneAndUpdate({_id: layoutId, board: boardId}, dataToUpdate, {new: true}).lean();

        const updateEntityTask = (nextTask) => updateQuery.exec(nextTask);

        //TODO: OTIMIZAR para nao pegar sempre os cartoes, funcionalidade utilizada para popular os cartoes na alteracao de layout e do quadro
        const getCardsTask = (updatedEntity, nextTask) =>
        {
            let query = db.card.find({board: boardId, status: enums.cardStatus.inboard.name}).select('-description');
            if (lstCardPopulateFields)
            {
                for (let index in lstCardPopulateFields) //eslint-disable-line
                {
                    query.populate(lstCardPopulateFields[index]);
                }
            }
            query.lean().exec((err, cards) => nextTask(err, updatedEntity, cards));
        };

        const endTask = (err, updatedEntity, cards) =>
        {
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, db.boardLane, layoutId, entityToSave, updatedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, `id: ${updatedEntity._id}`));
                var cardsHashmap = _.fromPairs(cards.map(function(item) {return [item._id.toString(), item];}));
                that._addTreeField(updatedEntity.rootNode, 0, ',', '/', cardsHashmap);
                return res.send(201, {data: updatedEntity});
            });
        };

        return async.waterfall([updateEntityTask.bind(this), getCardsTask.bind(this)], endTask.bind(this));

    }

    _executeLayoutAction(req, res, next, actionName, actionToExecute)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new BoardLaneApiLoggerInfo(actionName);

        const data = ApiUtils.getBodyModel(req);

        const laneId = req.params.id;
        let path = data.lanePath;
        const layoutNonce = mongoose.Types.ObjectId(data.layoutNonce);
        const dataToLog = data;

        const getLayoutTask = (nextTask) => this.getBoardLane(req, res, (err, layout) => nextTask(err, layout), true);

        const endTask = (err, layoutToUpdate) =>
        {
            if (layoutToUpdate.nonce.toString() !== layoutNonce.toString())
            {
                logger.error('Conflict Update', loggerInfo.create(dataToLog, 'Conflict Update'));
                return next(new errors.concurrencyError(data));
            }
            layoutToUpdate = actionToExecute(layoutToUpdate, path, laneId);
            return this._update(req, res, next, actionName, layoutToUpdate);
        };
        async.waterfall([getLayoutTask.bind(this)], endTask.bind(this));
    }

    _getParentByPath(rootNode, path)
    {
        const pathParts = path.split(',');
        const parentId = pathParts[pathParts.length - 1];
        return commonUtils.treeUtil.getNodeById(rootNode, parentId);
    }
}

let boardLaneApi = new BoardLaneApi();
module.exports = function(server, socketIO)
{
    server.get({path: '/boards/:boardId/layout', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.getBoardLane.bind(boardLaneApi));
    server.put({path: '/boards/:boardId/layout/:layoutId', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.updateLayout.bind(boardLaneApi));
    server.put({path: '/boards/:boardId/layout/:layoutId/cardAllocation', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.moveCard.bind(boardLaneApi, socketIO));

    server.del({path: '/boards/:boardId/layout/:layoutId/lane/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.deleteLane.bind(boardLaneApi));

    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/actions/moveLeft', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.moveLeft.bind(boardLaneApi));
    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/actions/moveRight', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.moveRight.bind(boardLaneApi));

    server.put({path: '/boards/:boardId/layout/:layoutId/actions/addTopLaneAtTheEnd', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.addTopLaneAtTheEnd.bind(boardLaneApi));

    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/actions/addChild', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.addChild.bind(boardLaneApi));
    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/actions/clone', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.clone.bind(boardLaneApi));

    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/actions/splitHorizontal', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.splitLaneHorizontal.bind(boardLaneApi));
    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/actions/splitVertical', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.splitLaneVertical.bind(boardLaneApi));

    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/action/increaseCardWide', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.increaseCardWide.bind(boardLaneApi));
    server.put({path: '/boards/:boardId/layout/:layoutId/lane/:id/action/decreaseCardWide', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardLaneApi.decreaseCardWide.bind(boardLaneApi));
};

module.exports.api = new BoardLaneApi();
