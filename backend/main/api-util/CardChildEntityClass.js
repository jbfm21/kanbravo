//TODO: ver se tem como nao repetir codigo com BoardCHildEntityClass
'use strict';

const async = require('async');
const path = require('path');
const _ = require('lodash');

const FormError = require('../errors/form-error');
const AppError = require('../errors/app-error');
const apiUtils = require('./api-utils');
const handleErrors = require('./handle-errors');
const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const directoryManager = require('./directory-manager').BoardDirectoryManager;

class ApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(api, action)
    {
        super(api, action);
    }
}

class CardChildEntityClass
{
    constructor(apiName, entityDbManager)
    {
        this.schemaName = entityDbManager.modelName;
        this.entityDbManager = entityDbManager;
        this.apiName = apiName;
    }

    _setPopulateInQuery(query, options)
    {
        if (options.populate)
        {
            for (let index in options.populate) //eslint-disable-line
            {
                query.populate(options.populate[index]);
            }
        }
    }

    _setConditionsInQuery(query, options)
    {
        if (options.equalConditions)
        {
            for (let index in options.equalConditions) //eslint-disable-line
            {
                let condition = options.equalConditions[index];
                query.where(condition.field).equals(condition.value);
            }
        }
    }

    _findAllPaginatingWithCursor(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            appendDataFn: null,
            sort: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'findAll');
        const that = this;

        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const limit = req.params.limit ? Number(req.params.limit) : 10;
        let cursor = {};
        if (req.params.before) {cursor['before'] = req.params.before;} //eslint-disable-line
        if (req.params.after) {cursor['after'] = req.params.after;} //eslint-disable-line
        let dataToLog = {boardId: boardId, cardId: cardId};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        const getPageTask = (nextTask) =>
        {
            let query = that.entityDbManager.paginate(cursor, '_id').where({board: boardId, card: cardId}).limit(limit);
            if (actualOptions.populate)
            {
                query = query.populate(actualOptions.populate);
            }
            if (actualOptions.sort)
            {
                query = query.sort(actualOptions.sort);
            }
            query = query.lean();
            query.execPagination(nextTask);
        };

        const getTotalElementsInDbTask = (pageResult, nextTask) =>
        {
             let query = that.entityDbManager.where({board: boardId, card: cardId});
             that.entityDbManager.count(query).exec((err, totalOfElementsInDb) => nextTask(err, pageResult, totalOfElementsInDb));
        };

        const endTask = (err, pageResult, totalOfElementsInDb) =>
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, pageResult));
            let objectToReturn = {boardId: boardId, cardId: cardId, before: pageResult.before, after: pageResult.after, total: totalOfElementsInDb, limit: pageResult.perPage, data: pageResult.results};
            if (actualOptions.appendDataFn)
            {
                Object.assign(objectToReturn, actualOptions.appendDataFn(req));
            }
            return res.json(objectToReturn);
        };

        async.waterfall([getPageTask.bind(this), getTotalElementsInDbTask.bind(this)], endTask.bind(this));
    }

    _findAllWithoutPaginating(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            appendDataFn: null,
            equalConditions: null,
            sort: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'findAll');
        const that = this;

        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const dataToLog = {boardId: boardId, cardId: cardId};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        var query = that.entityDbManager.find({board: boardId, card: cardId}).lean();

        if (actualOptions.sort)
        {
            query = query.sort(actualOptions.sort);
        }

        this._setConditionsInQuery(query, actualOptions);
        this._setPopulateInQuery(query, actualOptions);

        query.exec(function (err, dbDataList)
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            logger.debug('Finished');
            let objectToReturn = {boardId: boardId, cardId: cardId, data: dbDataList};
            if (actualOptions.appendDataFn)
            {
                Object.assign(objectToReturn, actualOptions.appendDataFn(req));
            }
            return res.json(objectToReturn);
        });
    }

    _findOne(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            filter: null,
            equalConditions: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'findOne');

        const filterQuery = actualOptions.filter(req, res);
        const dataToLog = {filterQuery: filterQuery};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getEntityTask = (nextTask) =>
        {
            let query = this.entityDbManager.findOne(filterQuery).lean();
            this._setConditionsInQuery(query, actualOptions);
            this._setPopulateInQuery(query, actualOptions);
            query.exec(nextTask);
        };

        const endTask = (err, result) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, result));
            return res.json({data: result});
        };
        async.waterfall([getEntityTask.bind(this)], endTask.bind(this));
    }

    findAll(req, res, next, options)
    {
        if (req.params.all || !this.entityDbManager.paginate)
        {
            this._findAllWithoutPaginating(req, res, next, options);
            return;
        }
        this._findAllPaginatingWithCursor(req, res, next, options);
    }

    findById(req, res, next, options)
    {
        let filter = (innerReq, innerRes) => //eslint-disable-line
        {
            const cardId = req.params.cardId;
            const entityId = innerReq.params.id;
            return {_id: entityId, card: cardId};
        };
        options.filter = filter;
        return this._findOne(req, res, next, options);
    }

    findOne(req, res, next, options)
    {
        this._findOne(req, res, next, options);
    }

    deleteData(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            canExecuteActionFn: null,
            posOperation: null,
            forceDelete: false
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'deleteData');

        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const entityId = req.params.id;
        const dataToLog = {boardId: boardId, cardId: cardId, entityId: entityId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        let canDeleteEntityTask = (actualOptions.canExecuteActionFn) ? actualOptions.canExecuteActionFn : (innerReq, innerRes, nextTask) => nextTask();

        const deleteEntityTask = (nextTask) =>
        {
            if (!actualOptions.forceDelete && this.entityDbManager.delete)
            {
                return this.entityDbManager.delete({_id: entityId, board: boardId, card: cardId}, nextTask);
            }
            return this.entityDbManager.findOneAndRemove({_id: entityId, board: boardId, card: cardId}, nextTask);
        };

        const endTask = (err, deletedEntity) =>
        {
            if (handleErrors.handleDeleteError(req, res, next, logger, loggerInfo, err, dataToLog, deletedEntity))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, deletedEntity));
            return res.send(200, {deletedId: entityId});
        };

        let operations = [canDeleteEntityTask.bind(this, req, res), deleteEntityTask.bind(this)];

        if (actualOptions.posOperation)
        {
            operations.push(actualOptions.posOperation.bind(this));
        }

        async.waterfall(operations, endTask.bind(this));
    }

    addData (req, res, next, options) //eslint-disable-line consistent-return
    {
        let actualOptions = _.defaults(options || {},
        {
            canExecuteActionFn: null,
            appendDataBeforeSaveFn: null,
            populateAfterSave: null,
            posOperation: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'addData');
        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        let dataToAdd = apiUtils.getBodyModel(req);
        const dataToLog = {boardId: boardId, cardId: cardId, dataToAdd: dataToAdd};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        if (!dataToAdd)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new AppError(res.__('INVALID_REQUEST')));
        }
        dataToAdd.board = boardId;
        dataToAdd.card = cardId;

        //TODO: colocar em um diretorio especifico para o cartao
        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        this._setAvatarImageFileName(boardId, dataToAdd, avatarImageFile);

        let canAddEntity = (actualOptions.canExecuteActionFn) ? actualOptions.canExecuteActionFn : (innerReq, innerRes, nextTask) => nextTask();

        const getDataToAppendTask = (nextTask) =>
        {
            return (actualOptions.appendDataBeforeSaveFn) ? actualOptions.appendDataBeforeSaveFn(req, res, dataToAdd, nextTask) : nextTask(null, null);
        };

        const saveEntityTask = (dataToAppend, nextTask) =>
        {
            if (dataToAppend)
            {
                dataToAdd = _.assign(dataToAdd, dataToAppend);
            }
            let entityToSave = new this.entityDbManager(dataToAdd);
            let validationError = entityToSave.validateSync();
            if (validationError)
            {
                logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
                return nextTask(new FormError(validationError.errors));
            }
            return entityToSave.save(nextTask);
        };

        const createAvatarTask = (savedEntity, numAffected, nextTask) => //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedEntity);
            }
            //TODO: colocar em um diretorio especifico para o cartao
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(boardId, avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const endTask = (err, savedEntity) =>
        {
            if (handleErrors.handleAddError(req, res, next, logger, loggerInfo, err, dataToLog, dataToAdd, savedEntity, this._getAlreadyExistFieldName))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, `id: ${savedEntity._id}`));
            if (actualOptions.populateAfterSave)
            {
                savedEntity.populate(actualOptions.populateAfterSave, (populateError) =>
                {
                    if (populateError)
                    {
                        logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'while populating saved entity'));
                        return next(new AppError(res.__('INVALID_REQUEST')));
                    }
                    return res.send(201, {data: savedEntity});
                });
                return; //eslint-disable-line
            }
            return res.send(201, {data: savedEntity});
        };

        let operations = [canAddEntity.bind(this, req, res), getDataToAppendTask.bind(this), saveEntityTask.bind(this), createAvatarTask.bind(this)];
        if (actualOptions.posOperation)
        {
            operations.push(actualOptions.posOperation.bind(this));
        }

        async.waterfall(operations, endTask.bind(this));
    }

    updateData(req, res, next, options) //eslint-disable-line consistent-return
    {
        let actualOptions = _.defaults(options || {},
        {
            canExecuteActionFn: null,
            createDataToUpdate: null,
            populate: null,
            populateAfterSave: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'updateData');

        const id = req.params.id;
        const boardId = req.params.boardId;
        const cardId = req.params.cardId;

        let dataToUpdate = (actualOptions.createDataToUpdate) ? actualOptions.createDataToUpdate(req, res, apiUtils.getBodyModel(req)) : apiUtils.getBodyModel(req);

        const dataToLog = {boardId: boardId, cardId: cardId, entityId: id, dataToUpdate: dataToUpdate};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        if (!dataToUpdate)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new AppError(res.__('INVALID_REQUEST')));
        }
        dataToUpdate.board = boardId;
        dataToUpdate.card = cardId;

        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        this._setAvatarImageFileName(boardId, dataToUpdate, avatarImageFile);

        let entityToSave = new this.entityDbManager(dataToUpdate);

        const validationError = entityToSave.validateSync();
        if (validationError)
        {
            logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
            return next(new FormError(validationError.errors));
        }

        let updateQuery = this.entityDbManager.findOneAndUpdate({_id: id, board: boardId, card: cardId}, dataToUpdate, {new: true});
        this._setPopulateInQuery(updateQuery, actualOptions);

        const canUpdateEntityTask = (actualOptions.canExecuteActionFn) ? actualOptions.canExecuteActionFn : (innerReq, innerRes, nextTask) => nextTask();

        const updateEntityTask = (nextTask) => updateQuery.exec(nextTask);

        const createAvatarTask = (savedEntity, nextTask) => //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedEntity);
            }
            //TODO: colocar em um diretorio especifico para o cartao
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(boardId, avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const endTask = (err, updatedEntity) =>
        {
            //TODO: id passado no handleErros = = {_id: id, board: boardId, cardId: cardId}
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, this.entityDbManager, id, entityToSave, updatedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, `id: ${updatedEntity._id}`));
                if (actualOptions.populateAfterSave)
                {
                    updatedEntity.populate(actualOptions.populateAfterSave, (populateError) =>
                    {
                        if (populateError)
                        {
                            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'while populating saved entity'));
                            return next(new AppError(res.__('INVALID_REQUEST')));
                        }
                        return res.send(201, {data: updatedEntity});
                    });
                    return; //eslint-disable-line
                }
                return res.send(201, {data: updatedEntity});
            }, this._getAlreadyExistFieldName);
        };

        async.waterfall([canUpdateEntityTask.bind(this, req, res), updateEntityTask.bind(this), createAvatarTask.bind(this)], endTask.bind(this));
    }

    _setAvatarImageFileName(boardId, data, avatarImageFile)
    {
        const avatarImageFileName = (avatarImageFile) ? directoryManager.getRelativeDir(boardId) + '/' + path.basename(avatarImageFile.path) : null;

        if (!avatarImageFile || !avatarImageFileName)
        {
            return;
        }
        if (!data.avatar)
        {
            data['avatar'] = {}; //eslint-disable-line dot-notation
        }
        data.avatar['imageSrc'] = avatarImageFileName; //eslint-disable-line dot-notation
    }

    _getAlreadyExistFieldName(err)
    {
        //Exemplo de mensagem "E11000 duplicate key error index: qkanban-test.priorities.$title_1 dup key: { : "title4" }".
        //a funçaõ retorna title
        //return err.message.match(new RegExp(/^.*\.\$(.*)_.*$/))[1];
        if (err)
        {
            return 'title';
        }
        return '';
    }
}

module.exports = CardChildEntityClass;

/*findAllPaginatingByOffset(req, res, next, options)
{
    let actualOptions = _.defaults(options || {},
    {
        populate: null
    });

    let logger = new Logger(req.log);
    let loggerInfo = new ApiLoggerInfo(this.apiName, 'findAll');
    var that = this;

    var boardId = req.params.boardId;
    var cardId = req.params.cardId;
    let offset = Number(req.params.offset);
    let limit = req.params.limit ? Number(req.params.limit) : 10;
    let sort = req.params.sort;
    let dataToLog = {boardId: boardId, cardId: cardId};
    logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

    that.entityDbManager.paginate({board: boardId, card: cardId}, {sort: sort, offset: offset, limit: limit, populate: actualOptions.populate, leanWithId: true}, function (err, result)
    {
        if (err)
        {
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            return next(new AppError(res.__('INVALID_REQUEST')));
        }
        logger.debug('Finished');
        return res.json({offset: result.offset, limit: result.limit, total: result.total, sort: sort, data: result.docs});
    });
}*/
