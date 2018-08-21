'use strict';

const mongoose = require('mongoose');
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

class BoardChildEntityClass
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

    findAll(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            projection: null,
            callback: null,
            filter: null
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'findAll');
        const that = this;

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        let filter = {};
        //TODO: tornar generico esses tipos de filtros
        if (actualOptions.filter)
        {
            //TODO: verificar se o parametro filter é string ou não, por enquanto só é usado no metodo findall do cartao e de listagem de projeto
            if (actualOptions.filter === 'phase!=close')
            {
                filter = {phase: {$ne: 'close'}};
            }
            else
            {
                filter = actualOptions.filter;
            }
        }

        let query = that.entityDbManager.findWithoutDeleted ? that.entityDbManager.findWithoutDeleted(filter) : that.entityDbManager.find(filter);

        query = query.lean().where('board').equals(boardId);
        if (actualOptions.projection)
        {
            query = query.select(actualOptions.projection);
        }

        this._setPopulateInQuery(query, actualOptions);

        query.exec(function (err, dbDataList)
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            logger.debug('Finished');
            if (actualOptions.callback)
            {
                return actualOptions.callback(err, dbDataList);
            }
            return res.json({boardId: boardId, data: dbDataList});
        });
    }

    searchByTitle(req, res, next, options)  //eslint-disable-line consistent-return
    {
        let filter = null;
        let searchTerm = null;
        if (req.params || req.body)
        {
            //TODO: melhorar, foi necessario isso pois o metodo getAllBOardConfig é chamado via http e via chamada de método direto, não passando as informações de req
            filter = (req.params && req.params.filter) ? req.params.filter : (req.body) ? req.body.filter : null; //eslint-disable-line
            searchTerm = (req.params && req.params.searchTerm) ? req.params.searchTerm : (req.body) ? req.body.searchTerm : '[searchall]'; //eslint-disable-line
        }
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            projection: null,
            callback: null,
            filter: filter
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'searchByTitle');

        const boardId = req.params.boardId;

        const dataToLog = {boardId: boardId, searchTerm: searchTerm};

        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        if (!searchTerm)
        {
            //Evitar que retorne todas as entidades enquanto nenhum filtro
            //for passado na busca
            return res.json({data: []});
        }

        if (searchTerm.toLowerCase() === '[searchall]')
        {
            //Parâmetro coringa para retornar todas as entidades
            return this.findAll(req, res, next, actualOptions);
        }

        const regexString = apiUtils.createSearchRegExpPattern(searchTerm);
        const re = new RegExp(regexString, 'ig');

        let query = this.entityDbManager.aggregate().match({title: re, board: mongoose.Types.ObjectId(boardId)});

        this._setPopulateInQuery(query, actualOptions);
        query.exec(function (err, dbDataList)
        {
            if (handleErrors.handleFindListError(req, res, next, logger, loggerInfo, err))
            {
                return null;
            }
            logger.debug('Finished');
            if (actualOptions.callback)
            {
                return actualOptions.callback(err, dbDataList);
            }
            return res.json({data: dbDataList});
        });
    }

    _findOne(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            populate: null,
            appendDataFn: null,
            callback: null,
            filter: null,
            lean: true
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, '_find');

        if (!actualOptions.filter)
        {
            logger.error('InvalidRequest', loggerInfo.create('Filter not configured', 'Error'));
        }

        const filterQuery = actualOptions.filter(req, res);
        const dataToLog = {filterQuery: filterQuery};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        const getEntityTask = (nextTask) =>
        {
            let query = this.entityDbManager.findOne(filterQuery);
            if (actualOptions.lean)
            {
                query = query.lean();
            }
            this._setPopulateInQuery(query, actualOptions);
            query.exec(nextTask);
        };

        const getDataToAppendTask = (entity, nextTask) =>
        {
            return (actualOptions.appendDataFn) ? actualOptions.appendDataFn(req, res, entity, nextTask) : nextTask(null, entity);
        };

        const endTask = (err, result) =>
        {
            if (handleErrors.handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, result));
            if (actualOptions.callback)
            {
                return actualOptions.callback(err, result);
            }
            return res.json({data: result});
        };
        async.waterfall([getEntityTask.bind(this), getDataToAppendTask.bind(this)], endTask.bind(this));
    }

    findById(req, res, next, options)
    {
        let filter = (innerReq, innerRes) => //eslint-disable-line
        {
            const boardId = req.params.boardId;
            const entityId = innerReq.params.id;
            return {_id: entityId, board: boardId};
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
            forceDelete: false
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'deleteData');

        const boardId = req.params.boardId;
        const entityId = req.params.id;
        const dataToLog = {boardId: boardId, entityId: entityId};

        logger.debug('Start', loggerInfo.create(dataToLog, null));

        let canDeleteEntityTask = (actualOptions.canExecuteActionFn) ? actualOptions.canExecuteActionFn : (innerReq, innerRes, nextTask) => nextTask();

        const deleteEntityTask = (nextTask) =>
        {
            if (!actualOptions.forceDelete && this.entityDbManager.delete)
            {
                return this.entityDbManager.delete({_id: entityId, board: boardId}, nextTask);
            }
            return this.entityDbManager.findOneAndRemove({_id: entityId, board: boardId}, nextTask);
        };

        const endTask = (err, deletedEntity) =>
        {
            if (handleErrors.handleDeleteError(req, res, next, logger, loggerInfo, err, dataToLog, deletedEntity))
            {
                return null;
            }
            logger.info('Success', loggerInfo.create(dataToLog, dataToLog));
            return res.send(200, {data: ''});
        };

        async.waterfall([canDeleteEntityTask.bind(this, req, res), deleteEntityTask.bind(this)], endTask.bind(this));
    }

    addData (req, res, next, options) //eslint-disable-line consistent-return
    {
        let actualOptions = _.defaults(options || {},
        {
            canExecuteActionFn: null,
            appendDataBeforeSaveFn: null, //TODO: renomear para appendDatasBeforeExecuteActionFn
            populate: null, //TODO: renomear para populateAfterExecuteAction
            lean: true
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'addData');
        const boardId = req.params.boardId;
        let dataToAdd = apiUtils.getBodyModel(req);
        const dataToLog = {boardId: boardId, dataToAdd: dataToAdd};

        logger.debug('Start', loggerInfo.create({board: boardId}, null));

        if (!dataToAdd)
        {
            logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Send Null DATA'));
            return next(new AppError(res.__('INVALID_REQUEST')));
        }
        dataToAdd.board = boardId;

        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;
        this._setAvatarImageFileName(boardId, dataToAdd, avatarImageFile);

        const canAddEntityTask = (actualOptions.canExecuteActionFn) ? actualOptions.canExecuteActionFn : (innerReq, innerRes, nextTask) => nextTask();

        const getDataToAppendBeforeSaveTask = (nextTask) =>
        {
            return (actualOptions.appendDataBeforeSaveFn) ? actualOptions.appendDataBeforeSaveFn(req, res, dataToAdd, nextTask) : nextTask(null, null);
        };

        const saveEntityTask = (dataToAppend, nextTask) =>
        {
            if (dataToAppend)
            {
                dataToAdd = _.assign(dataToAdd, dataToAppend);
            }
            //TODO: Verificar pq o default não está funcionando
            if (!dataToAdd.wipLimit)
            {
                dataToAdd.wipLimit = 0;
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
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(boardId, avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const populateSavedEntityTask = (savedEntity, nextTask) =>
        {
            if (!actualOptions.populate)
            {
                return nextTask(null, savedEntity);
            }

            let query = this.entityDbManager.findById(savedEntity._id);
            if (actualOptions.lean)
            {
                query = query.lean();
            }

            this._setPopulateInQuery(query, actualOptions);

            return query.exec(nextTask);
        };

        const endTask = (err, savedEntity) =>
        {
            if (handleErrors.handleAddError(req, res, next, logger, loggerInfo, err, dataToLog, dataToAdd, savedEntity, this._getAlreadyExistFieldName))
            {
                return null;
            }

            logger.info('Success', loggerInfo.create(dataToLog, `id: ${savedEntity._id}`));
            return res.send(201, {data: savedEntity});
        };

        async.waterfall([canAddEntityTask.bind(this, req, res), getDataToAppendBeforeSaveTask.bind(this), saveEntityTask.bind(this), createAvatarTask.bind(this), populateSavedEntityTask.bind(this)], endTask.bind(this));
    }

    updateData(req, res, next, options) //eslint-disable-line consistent-return
    {
        let actualOptions = _.defaults(options || {},
        {
            canExecuteActionFn: null,
            createDataToUpdate: null,
            appendDataAfterUpdateFn: null, //appendDataAfterExecuteActionFn
            populate: null //TODO: populateBeforeExecuteAction
        });

        const logger = new Logger(req.log);
        const loggerInfo = new ApiLoggerInfo(this.apiName, 'updateData');

        const id = req.params.id;
        const boardId = req.params.boardId;
        const avatarImageFile = (req.files && req.files.avatarImageFile) ? req.files.avatarImageFile : null;

        let requestedDataToUpdate = apiUtils.getBodyModel(req);
        const dataToLog = {boardId: boardId, entityId: id, dataToUpdate: requestedDataToUpdate};

        logger.debug('Start', loggerInfo.create({_id: id}, null));

        if (!requestedDataToUpdate)
        {
            logger.error('InvalidRequest', loggerInfo.create(requestedDataToUpdate, 'Send Null DATA'));
            return next(new AppError(res.__('INVALID_REQUEST')));
        }

        const canUpdateEntityTask = (actualOptions.canExecuteActionFn) ? actualOptions.canExecuteActionFn : (innerReq, innerRes, nextTask) => nextTask(null);

        const createDataToUpdate = (nextTask) =>
        {
            requestedDataToUpdate.board = boardId;
            return (actualOptions.createDataToUpdate) ? actualOptions.createDataToUpdate(req, res, requestedDataToUpdate, nextTask) : nextTask(null, requestedDataToUpdate);
        };

        const updateEntityTask = (dataToUpdate, nextTask) =>
        {
            requestedDataToUpdate = dataToUpdate; //configurado para que possa refletir nas verificações feitas em  handleErrors.handleUpdateError. Não apagar essa linha
            this._setAvatarImageFileName(boardId, dataToUpdate, avatarImageFile);
            const entityToValidate = new this.entityDbManager(dataToUpdate);

            if (!entityToValidate.title)
            {
                entityToValidate.title = 'dummy title to bypass validation in partial updates';
            }

            const validationError = entityToValidate.validateSync();
            if (validationError)
            {
                logger.error('InvalidFormData', loggerInfo.create(dataToLog, validationError));
                return nextTask(new FormError(validationError.errors));
            }
            let updateQuery = this.entityDbManager.findOneAndUpdate({_id: id, board: boardId}, dataToUpdate, {new: true});
            this._setPopulateInQuery(updateQuery, actualOptions);
            return updateQuery.exec(nextTask);
        };

        const createAvatarTask = (savedEntity, nextTask) => //eslint-disable-line consistent-return
        {
            if (!avatarImageFile)
            {
                return nextTask(null, savedEntity);
            }
            directoryManager.moveFromTemporaryDirectoryToAttachmentDir(boardId, avatarImageFile, (err) => nextTask(err, savedEntity));
        };

        const getDataToAppendAfterUpdateTask = (entity, nextTask) =>
        {
            return (actualOptions.appendDataAfterUpdateFn) ? actualOptions.appendDataAfterUpdateFn(req, res, entity.toObject(), nextTask) : nextTask(null, entity);
        };

        const endTask = (err, updatedEntity) =>
        {
            //TODO: id passado no handleErros = = {_id: id, board: boardId}
            handleErrors.handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, this.entityDbManager, id, requestedDataToUpdate, updatedEntity, (isErrorHandled) =>
            {
                if (isErrorHandled)
                {
                    return null;
                }
                logger.info('Success', loggerInfo.create(dataToLog, `id: ${updatedEntity._id}`));
                return res.send(201, {data: updatedEntity});
            }, this._getAlreadyExistFieldName);
        };
        async.waterfall([canUpdateEntityTask.bind(this, req, res), createDataToUpdate.bind(this), updateEntityTask.bind(this), createAvatarTask.bind(this), getDataToAppendAfterUpdateTask.bind(this)], endTask.bind(this));
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

module.exports = BoardChildEntityClass;
