'use strict';

//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const restify = require('restify');
const async = require('async');
const _ = require('lodash');

const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');

const accessControl = require('../api-util/access-control');
const ApiUtils = require('../api-util/api-utils');

const entityDbManager = require('../db/boardMember');
const AppError = require('../errors/app-error');
const dbBoard = require('../db/board');
const enums = require('../enums/index');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const BoardChildEntity = new BoardChildEntityClass('boards/boardMember', entityDbManager);

class BoardMemberApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('BoardMember', action);
    }
}

class MemberApi
{

    canUpdateRole(req, res, externalNextTask)
    {
        //check if is owner, cant change owner role
        const boardId = req.params.boardId;
        const memberBoardId = req.params.id;
        const dataToFind = {memberId: memberBoardId, boardId: boardId};

        const loggerInfo = new BoardMemberApiLoggerInfo('canUpdateRole');
        const logger = new Logger(req.log);

        const getMemberTask = (nextTask) => entityDbManager.findById(memberBoardId).lean().exec(nextTask);
        const checkIfIsBoardOwnerTask = (member, nextTask) => dbBoard.findOne({owner: member.user.toString(), _id: boardId}).exec(nextTask);
        const endTask = (err, result) =>
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToFind, 'Forbidden'));
                return externalNextTask(new restify.ForbiddenError('I just dont like you'));
            }
            if (result)
            {
                let dataToUpdate = ApiUtils.getBodyModel(req);
                if (dataToUpdate.role.toLowerCase() !== enums.role.member.name)
                {
                    logger.error('Cant change role because is owner', loggerInfo.create(dataToFind, 'Cant change role because is owner'));
                    return externalNextTask(new AppError(res.__('CANT_CHANGE_ROLE_BECAUSE_MEMBER_IS_BOARD_OWNER')));
                }
            }
            return externalNextTask();
        };
        async.waterfall([getMemberTask.bind(this), checkIfIsBoardOwnerTask.bind(this)], endTask.bind(this));
    }

    canUpdatePreference(req, res, externalNextTask)
    {
        const loggerInfo = new BoardMemberApiLoggerInfo('canUpdatePreference');
        const logger = new Logger(req.log);
        const memberBoardId = req.params.id;
        const boardId = req.params.boardId;
        const loggedUserId = req.user._id;
        const dataToLog = {_id: memberBoardId, board: boardId, loggedUser: loggedUserId};
        entityDbManager.findOne({_id: memberBoardId, board: boardId}).lean().exec((err, boardMember) =>
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Cant change board user preferences because this is not the user preferences'));
                return externalNextTask(new AppError(res.__('CANT_CHANGE_USER_PREFERENCES_bECAUSE_THE_PREFERENCE_DOESNT_BELONG_TO_USER')));
            }
            if (loggedUserId !== boardMember.user.toString())
            {
                logger.error('Cant change board user preferences because this is not the user preferences', loggerInfo.create(dataToLog, 'Cant change board user preferences because this is not the user preferences'));
                return externalNextTask(new AppError(res.__('CANT_CHANGE_USER_PREFERENCES_bECAUSE_THE_PREFERENCE_DOESNT_BELONG_TO_USER')));
            }
            return externalNextTask();

        });
    }

    canDelete(req, res, externalNextTask)
    {
        //Ensure is not board owner
        const boardId = req.params.boardId;
        const memberBoardId = req.params.id;
        const dataToFind = {memberId: memberBoardId, boardId: boardId};

        const loggerInfo = new BoardMemberApiLoggerInfo('canDelete');
        const logger = new Logger(req.log);

        const getMemberTask = (nextTask) => entityDbManager.findById(memberBoardId).lean().exec(nextTask);
        const checkIfIsBoardOwnerTask = (member, nextTask) => dbBoard.findOne({owner: member.user.toString(), _id: boardId}).exec(nextTask);
        const endTask = (err, result) =>
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToFind, 'Forbidden'));
                return externalNextTask(new restify.ForbiddenError('I just dont like you'));
            }
            if (result)
            {
                logger.error('Cant Delete because is owner', loggerInfo.create(dataToFind, 'Cant Delete because is owner'));
                return externalNextTask(new AppError(res.__('CANT_DELETE_BECAUSE_MEMBER_IS_BOARD_OWNER')));
            }
            return externalNextTask();
        };
        async.waterfall([getMemberTask.bind(this), checkIfIsBoardOwnerTask.bind(this)], endTask.bind(this));
    }

    getRoleToUpdate(req, res, dataToUpdate, nextTask)  //eslint-disable-line no-unused-vars
    {
        return nextTask(null, {role: dataToUpdate.role, hourPerDay: dataToUpdate.hourPerDay, wipLimit: dataToUpdate.wipLimit});
    }

    getPreferenceToUpdate(req, res, entity, nextTask) //eslint-disable-line no-unused-vars
    {
        return nextTask(null, {boardPreference: entity.boardPreference});
    }

    getQueryFilterToGetLoggedUserPreference(req, res) //eslint-disable-line no-unused-vars
    {
        const userId = req.user._id;
        const boardId = req.params.boardId;
        return {board: boardId, user: userId};
    }

    search(req, res, next, options)
    {
        let actualOptions = _.defaults(options || {},
        {
            callback: null
        });

        const loggerInfo = new BoardMemberApiLoggerInfo('_search');
        const logger = new Logger(req.log);

        const boardId = req.params.boardId;
        const dataToLog = {boardId: boardId};
        logger.debug('Start', loggerInfo.create(dataToLog, 'Start'));

        let query = entityDbManager.findWithoutDeleted().lean().where('board').equals(boardId).populate('user');
        query.exec(function (err, dbDataList)
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Exception'));
                return next(new AppError(res.__('INVALID_REQUEST')));
            }
            if (actualOptions.callback)
            {
                return actualOptions.callback(err, dbDataList);
            }
            return res.json({boardId: boardId, data: dbDataList});
        });
    }


    findAll(req, res, next) { return BoardChildEntity.findAll(req, res, next, {populate: [{path: 'user'}]});}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}

    addData(req, res, next) //eslint-disable-line
    {
        const loggerInfo = new BoardMemberApiLoggerInfo('addData');
        const logger = new Logger(req.log);
        const boardId = req.params.boardId;
        let dataToAdd = ApiUtils.getBodyModel(req);
        const userId = dataToAdd.user;
        if (userId === null)
        {
            return next(new AppError(res.__('INVALID_MEMBER_USER')));
        }
        entityDbManager.findOneDeleted({board: boardId, user: userId}, (err, member) => //eslint-disable-line
        {
            //Add new member or restore a deleted member
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToAdd, 'Exception'));
                return next(new AppError(res.__('INVALID_REQUEST')));
            }
            if (!member)
            {
                return BoardChildEntity.addData(req, res, next);
            }
            entityDbManager.restoreAndUpdate({board: boardId, user: userId}, dataToAdd, (innerErr, result) =>
            {
                if (innerErr)
                {
                    logger.exception(err, 'Exception', loggerInfo.create(dataToAdd, 'Exception'));
                    return next(new AppError(res.__('INVALID_REQUEST')));
                }
                return res.send(201, {data: result});
            });
        });
    }

    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next, {canExecuteActionFn: this.canDelete});}
    updateRoleData(req, res, next) {return BoardChildEntity.updateData(req, res, next, {canExecuteActionFn: this.canUpdateRole, createDataToUpdate: this.getRoleToUpdate});}
    updatePreferenceData(req, res, next) {return BoardChildEntity.updateData(req, res, next, {canExecuteActionFn: this.canUpdatePreference, createDataToUpdate: this.getPreferenceToUpdate});}
    getLoggedUserBoardPreference(req, res, next) {return BoardChildEntity.findOne(req, res, next, {filter: this.getQueryFilterToGetLoggedUserPreference});}

}

let memberApi = new MemberApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/boardMembers/preference', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.getLoggedUserBoardPreference.bind(memberApi));
    server.put({path: '/boards/:boardId/boardMembers/:id/preference', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.updatePreferenceData.bind(memberApi));

    server.get({path: '/boards/:boardId/boardMembers', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.findAll.bind(memberApi));
	server.get({path: '/boards/:boardId/boardMembers/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.search.bind(memberApi));

    server.get({path: '/boards/:boardId/boardMembers/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.findById.bind(memberApi));
	server.post({path: '/boards/:boardId/boardMembers', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.addData.bind(memberApi));
    server.put({path: '/boards/:boardId/boardMembers/:id/role', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.updateRoleData.bind(memberApi));
    server.del({path: '/boards/:boardId/boardMembers/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, memberApi.deleteData.bind(memberApi));
};

module.exports.api = new MemberApi();
