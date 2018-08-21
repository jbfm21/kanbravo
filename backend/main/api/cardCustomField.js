'use strict';
const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const async = require('async');
const entityDbManager = require('../db/cardCustomField');
const dbCustomFieldConfig = require('../db/customFieldConfig');
const accessControl = require('../api-util/access-control');
const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const handleErrors = require('../api-util/handle-errors');
const FormError = require('../errors/form-error');
const AppError = require('../errors/app-error');
const apiUtils = require('../api-util/api-utils');
const enums = require('../enums');
const ObjectId = mongoose.Types.ObjectId;

//TODO: o helpText só é retornado por conter valores para o dropbox, para diminuir a quantidade de bytes trafegados criar uma coluna especifica para isso e utiliza-la
//const fieldsToPopulate = [{path: 'type', select: '_id title avatar showInCard fieldType order'}];
const fieldsToPopulateFilterByShowInCard = [{path: 'fields.type', select: '_id title avatar showInCard fieldType order', match: {showInCard: {$in: [enums.showInCard.avatar.name, enums.showInCard.value.name]}}}];

class CardCustomFieldApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('CardCustomFieldApi', action);
    }
}

class CardCustomFieldApi
{
    validateField(req, res, externalNextTask)
    {
        let dataToAdd = apiUtils.getBodyModel(req);
        const typeId = (dataToAdd.type && dataToAdd.type._id) ? dataToAdd.type._id : dataToAdd.type;
        const getCustomFieldConfig = (nextTask) => dbCustomFieldConfig.findById(typeId).select('fieldType -_id').lean().exec(nextTask);
        const endTask = (err, customFieldConfig) =>
        {
            if (!dataToAdd.value)
            {
                return externalNextTask();
            }
            switch (customFieldConfig.fieldType)
            {
                case enums.fieldType.short_string.name:
                    if (dataToAdd.value.length > 100) //TODO: centralizar o tamanho
                    {
                        return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_SHORT_TEXT'), path: 'value', value: dataToAdd.value}]));
                    }
                    return externalNextTask();

                case enums.fieldType.dropdown.name:
                    if (dataToAdd.value.length > 255) //TODO: centralizar o tamanho
                    {
                        return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_DROPDOWN_TEXT'), path: 'value', value: dataToAdd.value}]));
                    }
                    return externalNextTask();

                case enums.fieldType.text.name:
                    if (dataToAdd.value.length > 10000) //TODO: centralizar o tamanho
                    {
                        return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_TEXT'), path: 'value', value: dataToAdd.value}]));
                    }
                    return externalNextTask();
                case enums.fieldType.numeric.name:
                    if (!validator.isNumeric(dataToAdd.value))
                    {
                        return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_NUMERIC'), path: 'value', value: dataToAdd.value}]));
                    }
                    return externalNextTask();

                case enums.fieldType.date.name:
                    if (!validator.isDate(dataToAdd.value))
                    {
                        return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_DATE'), path: 'value', value: dataToAdd.value}]));
                    }
                    return externalNextTask();

                case enums.fieldType.datetime.name:
                    if (!validator.isDate(dataToAdd.value))
                    {
                        return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_DATE_TIME'), path: 'value', value: dataToAdd.value}]));
                    }
                    return externalNextTask();

                default:
                    return externalNextTask(new FormError([{message: res.__('CUSTOMFIELD_INVALID_TYPE'), path: 'value', value: dataToAdd.value}]));
            }
        };
        async.waterfall([getCustomFieldConfig.bind(this)], endTask.bind(this));
    }

    listToShowInCard(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardCustomFieldApiLoggerInfo(this.apiName, 'findAll');
        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const dataToLog = {boardId: boardId};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        let query = entityDbManager.findOne().lean().where({board: boardId, card: cardId}).populate({path: 'type', select: '_id title avatar showInCard fieldType order', match: {showInCard: {$in: [enums.showInCard.avatar.name, enums.showInCard.value.name]}}});

        for (let field of fieldsToPopulateFilterByShowInCard) //eslint-disable-line
        {
            query.populate(field);
        }

        query.exec(function (err, cardCustomFields)
        {
            if (!cardCustomFields)
            {
                let objectToReturn = {boardId: boardId, cardId: cardId, data: []};
                return res.json(objectToReturn);
            }
            //TODO: usar stream lodash
            let filteredDbDataList = _.filter(cardCustomFields.fields, (item) => item.type !== null);
            let sortedDbDataList = _.sortBy(filteredDbDataList, ['type.order']);
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            logger.debug('Finished');
            let objectToReturn = {boardId: boardId, cardId: cardId, data: sortedDbDataList};
            return res.json(objectToReturn);
        });
    }

    findAll(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardCustomFieldApiLoggerInfo(this.apiName, 'findOne');

        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const filterQuery = {board: boardId, card: cardId};
        let dataToLog = filterQuery;
        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getEntityTask = (nextTask) =>
        {
            let query = entityDbManager.findOne(filterQuery).lean();
            query.exec(nextTask);
        };

        const endTask = (err, result) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            if (!result)
            {
                result = {customFields: []};
            }
            logger.info('Success', loggerInfo.create(dataToLog, result));
            return res.json({data: result});
        };
        async.waterfall([getEntityTask.bind(this)], endTask.bind(this));
    }

    upinsertData(req, res, next)
    {
        const logger = new Logger(req.log);
        const loggerInfo = new CardCustomFieldApiLoggerInfo(this.apiName, 'updateData');

        const boardId = req.params.boardId;
        const cardId = req.params.cardId;

        let dataToUpdate = apiUtils.getBodyModel(req);
        delete dataToUpdate.board;
        delete dataToUpdate.card;

         dataToUpdate.nonce = new mongoose.Types.ObjectId();

        const typeId = (dataToUpdate.type && dataToUpdate.type._id) ? dataToUpdate.type._id : dataToUpdate.type;
        const dataToLog = {boardId: boardId, cardId: cardId, typeId: typeId, dataToUpdate: dataToUpdate};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        if (!dataToUpdate)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new AppError(res.__('INVALID_REQUEST')));
        }

        let entityToSave = new entityDbManager(dataToUpdate);

        const validationError = entityToSave.validateSync();
        if (validationError)
        {
            logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
            return next(new FormError(validationError.errors));
        }

        const canUpdateEntityTask = this.validateField;

        const updateEntityTask = (nextTask) =>
        {
            return entityDbManager.update(
                {board: ObjectId(boardId), card: ObjectId(cardId), 'fields.type': typeId},
                {$set: {'fields.$': dataToUpdate}},
                (err, affected) =>
                {
                    if (affected.n === 0)
                    {
                        return entityDbManager.findOneAndUpdate(
                            {board: ObjectId(boardId), card: ObjectId(cardId)},
                            {$push: {fields: dataToUpdate}},
                            {safe: true, upsert: true, ignoreNonce: true, new: true},
                            (err, updatedEntity) => nextTask(err, dataToUpdate) //eslint-disable-line
                        );
                    }
                    return nextTask(err, dataToUpdate);
                }
            );
        };

        const endTask = (err, updatedEntity) =>
        {
            //TODO: typeID, testar os casos de erro
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, entityDbManager, typeId, entityToSave, updatedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, 'Upinser custom field'));
                return res.send(201, {data: updatedEntity});
            }, null); //TODO: criar esse metodo, verificando se o tipo ja existe cadastrado
        };

        return async.waterfall([canUpdateEntityTask.bind(this, req, res), updateEntityTask.bind(this)], endTask.bind(this));
    }
}

const cardCustomFieldApi = new CardCustomFieldApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/cardCustomField/actions/listToShowInCard', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardCustomFieldApi.listToShowInCard.bind(cardCustomFieldApi));
    server.get({path: '/boards/:boardId/cards/:cardId/cardCustomField', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardCustomFieldApi.findAll.bind(cardCustomFieldApi));
    //server.get({path: '/boards/:boardId/cards/:cardId/cardCustomField/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardCustomFieldApi.findById.bind(cardCustomFieldApi));
	server.post({path: '/boards/:boardId/cards/:cardId/cardCustomField', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardCustomFieldApi.upinsertData.bind(cardCustomFieldApi));
};

module.exports.api = new CardCustomFieldApi();
