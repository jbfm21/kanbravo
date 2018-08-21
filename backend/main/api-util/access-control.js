'use strict';

const restify = require('restify');
const jwt = require('jwt-simple');
const _ = require('lodash');

const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const AppError = require('../errors/app-error');
const ApiUtils = require('./api-utils');
const role = require('../enums/role');
const boardVisibility = require('../enums/boardVisibility');

const dbBoardMember = require('../db/boardMember');
const dbBoard = require('../db/board');

const serverConfig = require('konfig')({path: __dirname + '/../config'}).app;

class AccessControlLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('AccessControl', action);
    }
}

class AccessControl
{
    constructor()
    {
        this.secretToken = serverConfig.token;
    }

    get token() {return this.secretToken;}

    ensureBoardBelongToUser(req, res, next, options) //eslint-disable-line
    {
        let actualOptions = _.defaults(options || {},
        {
            userId: null
        });

        const loggerInfo = new AccessControlLoggerInfo('ensureBoardBelongToUser');
        const logger = new Logger(req.log);

        const userId = (actualOptions.userId) ? options.userId : req.user._id;
        const boardId = req.params.boardId;
        const dataToFind = {user: userId, board: boardId};
        const bodyData = ApiUtils.getBodyModel(req);

        if (bodyData && bodyData.boardId)
        {
            if (bodyData.boardId !== boardId)
            {
                logger.error('InvalidBodyData', loggerInfo.create(dataToFind, 'Forbidden. The boardId url is not equal of boardId in body data'));
                return next(new restify.ForbiddenError(res.__('FORBIDDEN_ERROR')));
            }
        }

        dbBoardMember.findOneWithoutDeleted(dataToFind, function(err, member) //eslint-disable-line
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToFind, 'Forbidden'));
                return next(new restify.ForbiddenError(res.__('FORBIDDEN_ERROR')));
            }
            if (!member)
            {
                dbBoard.findById(boardId).select('visibility').exec((innerErr, board) =>
                {
                    if (!board.visibility)
                    {
                        logger.error('NoResultFound', loggerInfo.create(dataToFind, 'Forbidden'));
                        return next(new restify.ForbiddenError(res.__('FORBIDDEN_ERROR')));
                    }
                    const isReadOnlyActionInPublicBoard = (board.visibility.toLowerCase() === boardVisibility.public.name.toLowerCase() && (req.method.toLowerCase() === 'get'));
                    if (isReadOnlyActionInPublicBoard)
                    {
                        return next();
                    }
                    if (board.visibility.toLowerCase() === boardVisibility.publicWrite.name.toLowerCase())
                    {
                        return next();
                    }
                    logger.error('NoResultFound', loggerInfo.create(dataToFind, 'Forbidden'));
                    return next(new restify.ForbiddenError(res.__('FORBIDDEN_ERROR')));
                });
            }
            else
            {
                if (!member.role)
                {
                    logger.error('User dont have associated role permission', loggerInfo.create(dataToFind, 'User dont have associated role permission'));
                    return next(new AppError(res.__('ERROR_MEMBER_wITHOUT_ROLE')));
                }
                if ((member.role.toLowerCase() !== role.member.name.toLowerCase()) && (req.method.toLowerCase() !== 'get'))
                {
                    logger.info('ReadAcessOnly', loggerInfo.create(dataToFind, 'ReadAccessOnly'));
                    return next(new AppError(res.__('ERROR_READ_PERMISSION_ONLY')));
                }
                return next();
            }
        });
    }

    ensureAuthenticated (req, res, next)
    {
        let loggerInfo = new AccessControlLoggerInfo('ensureAuthenticated');
        let logger = new Logger(req.log);
        if (!req.headers.authorization)
        {
            logger.error('UnauthorizedError', loggerInfo.create(null, 'UnauthorizedError'));
            return next(new restify.UnauthorizedError(res.__('FORBIDDEN_ERROR')));
        }
        const token = req.headers.authorization.split(' ')[1];
        try
        {
            const decoded = jwt.decode(token, serverConfig.token);
            if (decoded.exp <= Date.now())
            {
                logger.error('UnauthorizedError', loggerInfo.create(null, 'UnauthorizedError - Token expired'));
                return next(new restify.UnauthorizedError(res.__('FORBIDDEN_TOKEN_EXPIRED')));
            }
            req.user = decoded.user;
            return next();
        }
        catch (err)
        {
            logger.exception(err, 'Exception', loggerInfo.create(null, 'Exception'));
            return next(new restify.UnauthorizedError(res.__('FORBIDDEN_ERROR')));
        }
    }

}

module.exports = new AccessControl();
