'use strict';

const restify = require('restify');
const mongoose = require('mongoose');
const ValidationError = mongoose.Error.ValidationError;

const errors = require('../errors/index');
const mongoUtils = require('../db/mongo-utils');

class HandleErrors
{
    static convertError(res, err)
    {
        if (err)
        {
            if (err instanceof ValidationError)
            {
                return new errors.formError(err.errors);
            }
            if (err instanceof errors.formError)
            {
                return err;
            }

            if (err instanceof errors.appError)
            {
                return err;
            }

            if (err instanceof restify.errors.ResourceNotFoundError)
            {
                return err;
            }
            return new errors.appError(res.__('INVALID_REQUEST'));
        }
        return null;
    }
    static handleGenericError(req, res, next, logger, loggerInfo, err, dataToLog) //eslint-disable-line
    {
        if (!err)
        {
            return false;
        }
        if (err)
        {
            if (err instanceof ValidationError)
            {
                next(new errors.formError(err.errors));
            }
            if (err instanceof errors.formError)
            {
                next(err);
                return true;
            }

            if (err instanceof errors.appError)
            {
                next(err);
                return true;
            }

            if (err instanceof restify.errors.ResourceNotFoundError)
            {
                logger.error('EntityNotFound', loggerInfo.create(dataToLog, 'EntityNotFound'));
                next(err);
                return true;
            }
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
    }

    static handleFindListError(req, res, next, logger, loggerInfo, err)
    {
        if (err)
        {
            logger.exception(err, 'Exception', loggerInfo.create(null, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
        return false;
    }
    static handleFindOneError(req, res, next, logger, loggerInfo, err, dataToLog)
    {
        if (err)
        {
            if (err instanceof restify.errors.ResourceNotFoundError)
            {
                logger.error('InvalidRequest', loggerInfo.create(dataToLog, 'Resource not found'));
                next(err);
                return true;
            }
            if (err instanceof errors.appError)
            {
                next(err);
                return true;
            }
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
        return false;
    }

    static handleDeleteError(req, res, next, logger, loggerInfo, err, dataToLog, deletedEntity)
    {
        if (err instanceof restify.errors.ResourceNotFoundError)
        {
            logger.error('EntityNotFound', loggerInfo.create(dataToLog, 'EntityNotFound'));
            next(err);
            return true;
        }
        if (err instanceof errors.appError)
        {
            next(err);
            return true;
        }
        if (err)
        {
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
        if (!deletedEntity)
        {
            logger.error('EntityNotFound', loggerInfo.create(dataToLog, 'EntityNotFound'));
            next(new restify.errors.ResourceNotFoundError(res.__('RESOURCE_NOT_FOUND')));
            return true;
        }
        return false;

    }

    static handleAddError(req, res, next, logger, loggerInfo, err, dataToLog, entityToSave, savedEntity, getAlreadyExistFieldName)
    {
        if (err)
        {
            if (err instanceof errors.formError)
            {
                logger.error('ValidationError', loggerInfo.create(dataToLog, 'ValidationError'));
                next(err);
                return true;
            }
            if (err instanceof errors.appError)
            {
                next(err);
                return true;
            }
            if (mongoUtils.isEntityAlreadyExists(err))
            {
                logger.info('EntityAlreadyExists', loggerInfo.create(dataToLog, 'EntityAlreadyExists'));
                var fieldAlreadyExists = (getAlreadyExistFieldName) ? getAlreadyExistFieldName(err) : this._getAlreadyExistFieldName(err);
                next(new errors.formError([{path: fieldAlreadyExists, message: res.__('INVALID_ALREADY_EXISTS'), value: entityToSave[fieldAlreadyExists]}]));
                return true;
            }
            //TODO: Em todos os erros, verificar se deu erro de validação não capturada e logar, por exemplo se der erro de validação na criação do template (Dsv)
            //eh logado um erro generico não identificando qual campo deu erro exatamente, só consegui detectar ao dar console.log(err);
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
        if (!savedEntity)
        {
            logger.error('SavedEntityNotReturned', loggerInfo.create(dataToLog, 'SavedEntityNotReturned'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return true;
        }
        return false;
    }

    static handleUpdateError(req, res, next, logger, loggerInfo, err, dataToLog, entityDB, entityId, entityToSave, savedEntity, callback, getAlreadyExistFieldName) //eslint-disable-line
    {
        if (!err && savedEntity)
        {
            return callback(false);
        }
        if (err)
        {
            if (err instanceof errors.formError)
            {
                next(err);
                return callback(true);
            }

            if (err instanceof errors.appError)
            {
                next(err);
                return callback(true);
            }

            if (err instanceof restify.errors.ResourceNotFoundError)
            {
                logger.error('EntityNotFound', loggerInfo.create(dataToLog, 'EntityNotFound'));
                next(err);
                return callback(true);
            }

            if (mongoUtils.isEntityAlreadyExists(err))
            {
                logger.info('EntityAlreadyExists', loggerInfo.create(dataToLog, 'EntityAlreadyExists'));
                let fieldAlreadyExists = (getAlreadyExistFieldName) ? getAlreadyExistFieldName(err) : this._getAlreadyExistFieldName(err);
                let duplicatedValue = (entityToSave[fieldAlreadyExists]) ? (entityToSave[fieldAlreadyExists]) : 'undefined';
                next(new errors.formError([{path: fieldAlreadyExists, message: res.__('INVALID_ALREADY_EXISTS'), value: duplicatedValue}]));
                return callback(true);
            }
            logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
            next(new errors.appError(res.__('INVALID_REQUEST')));
            return callback(true);
        }
        if (!savedEntity)
        {
            entityDB.findOne({_id: entityId}, function(findOneErr, originalEntity)
            {
                if (!originalEntity)
                {
                    logger.error('EntityNotFound', loggerInfo.create(dataToLog, 'SavedEntityNotReturned'));
                    next(new restify.errors.ResourceNotFoundError(res.__('RESOURCE_NOT_FOUND')));
                    return callback(true);
                }
                logger.error('Conflict Update', loggerInfo.create(dataToLog, 'Conflict Update'));
                next(new errors.concurrencyError(originalEntity));
                return callback(true);
            });
        }
        else
        {
            return callback(false);
        }
    }

    static _getAlreadyExistFieldName(err)
    {
        //Exemplo de mensagem "E11000 duplicate key error index: qkanban-test.priorities.$title_1 dup key: { : "title4" }". a funçaõ retorna title
        if (err)
        {
            return err.message.match(new RegExp(/^.*\.\$(.*)_.*$/))[1];
        }
        return '';
    }
}

module.exports = HandleErrors;
