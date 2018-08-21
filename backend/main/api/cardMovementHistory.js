'use strict';
const mongoose = require('mongoose');

const entityDbManager = require('../db/cardMovementHistory');
const CardChildEntityClass = require('../api-util/CardChildEntityClass');
const accessControl = require('../api-util/access-control');
const apiUtils = require('../api-util/api-utils');
const handleErrors = require('../api-util/handle-errors');
const commonUtils = require('../commons/index');
const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const db = require('../db/index');

const CardChildEntity = new CardChildEntityClass('boards/card/cardMovementHistory', entityDbManager);

class CardMovementLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('CardMovementApi', action);
    }
}


class CardMovementHistoryApi
{
    findAll(req, res, next) {return CardChildEntity.findAll(req, res, next, {sort: {startDate: -1}});}
    findById(req, res, next) {return CardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return CardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return CardChildEntity.deleteData(req, res, next, {forceDelete: true});}
    updateData(req, res, next) {return CardChildEntity.updateData(req, res, next);}

    updateMovement(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardMovementLoggerInfo(this.apiName, 'updateMovement');

        const id = req.params.id;
        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        let dataToUpdate = apiUtils.getBodyModel(req);
        const movementId = dataToUpdate._id;
        let dataToLog = {id: id, boardId: boardId, cardId: cardId, movementId: movementId};

        entityDbManager.update(
            {_id: id, card: cardId, board: boardId, 'movements._id': movementId},
            {$set: {'movements.$': dataToUpdate}},
            {upsert: false},
            function(err)
            {
                handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, entityDbManager, id, dataToUpdate, dataToUpdate, (isErrorHandled) => //eslint-disable-line
                {
                    if (isErrorHandled)
                    {
                        return null;
                    }
                    entityDbManager.findOne({_id: id}).lean().exec((innerErr, result) =>
                    {
                        if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, innerErr, dataToLog))
                        {
                            return null;
                        }
                        logger.info('Success', loggerInfo.create(dataToLog, `id: ${dataToUpdate._id}`));
                        return res.send(201, {data: result});
                    });
                }, null);
            }
        );
    }

    deleteMovement(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardMovementLoggerInfo(this.apiName, 'deleteMovement');

        const id = req.params.id;
        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const movementId = req.params.movementId;
        let dataToLog = {id: id, boardId: boardId, cardId: cardId, movementId: movementId};

        entityDbManager.update(
            {_id: id, card: cardId, board: boardId},
            {$pull: {movements: {_id: movementId}}},
            {safe: true},
            function (err) //eslint-disable-line
            {
                if (handleErrors.handleDeleteError(req, res, next, logger, loggerInfo, err, dataToLog, {id: movementId}))
                {
                    return null;
                }
                entityDbManager.findOne({_id: id}).lean().exec((innerErr, result) =>
                {
                    if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, innerErr, dataToLog))
                    {
                        return null;
                    }
                    logger.info('Success', loggerInfo.create(dataToLog, `id: ${movementId}`));
                    return res.send(200, {data: result});
                });
            }
        );
    }

    saveMovementActionHistoryTask(startDate, card, targetLane, nextTask)
    {
        let activity = '';
        let path = commonUtils.treeUtil.createNodePathString(targetLane);
        commonUtils.treeUtil.transverseLeafNodeToParentAndDoAction(targetLane, (node) =>
        {
            activity = (activity === '' && node.activity) ? node.activity : activity;
        });

        const movementToInsert = {
            lane: targetLane._id,
            path: path,
            activity: activity,
            laneType: targetLane.laneType,
            startDate: startDate
        };
        return db.cardMovementHistory.findOneAndUpdate(
            {board: mongoose.Types.ObjectId(card.board), card: mongoose.Types.ObjectId(card._id)},
            {$push: {movements: movementToInsert}},
            {safe: true, upsert: true, ignoreNonce: true, new: true},
            (err, docs) => nextTask(err, card) //eslint-disable-line
        );
    }
}

const cardMovementHistoryApi = new CardMovementHistoryApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/cardMovementHistories', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.findAll.bind(cardMovementHistoryApi));
    server.get({path: '/boards/:boardId/cards/:cardId/cardMovementHistories/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.findById.bind(cardMovementHistoryApi));
	server.post({path: '/boards/:boardId/cards/:cardId/cardMoeimentHistories', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.addData.bind(cardMovementHistoryApi));
    server.put({path: '/boards/:boardId/cards/:cardId/cardMovementHistories/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.updateData.bind(cardMovementHistoryApi));
    server.del({path: '/boards/:boardId/cards/:cardId/cardMovementHistories/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.deleteData.bind(cardMovementHistoryApi));

    server.put({path: '/boards/:boardId/cards/:cardId/cardMovementHistories/:id/updateMovement', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.updateMovement.bind(cardMovementHistoryApi));
    server.del({path: '/boards/:boardId/cards/:cardId/cardMovementHistories/:id/deleteMovement/:movementId', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardMovementHistoryApi.deleteMovement.bind(cardMovementHistoryApi));
};

module.exports.api = new CardMovementHistoryApi();
