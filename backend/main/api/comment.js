'use strict';

const entityDbManager = require('../db/comment');
const CardChildEntityClass = require('../api-util/CardChildEntityClass');
const accessControl = require('../api-util/access-control');
const Logger = require('../logger/Logger');
const AbstractLoggerInfo = require('../logger/LoggerInfo');
const AppError = require('../errors/app-error');
const dbCard = require('../db/card');

const CardChildEntity = new CardChildEntityClass('boards/card/comment', entityDbManager);

class CommentApiLoggerInfo extends AbstractLoggerInfo
{
    constructor(action)
    {
        super('CommentApi', action);
    }
}


const fieldsToPopulate = [{path: 'author', select: 'nonce givenname surname nickname avatar'}];

class CommentApi
{
    static _posAdd(savedEntity, nextTask)
    {
        dbCard.findOneAndUpdate({_id: savedEntity.card}, {$inc: {numComments: 1}}, {ignoreNonce: true}, (err, data) => //eslint-disable-line
        {
            return nextTask(err, savedEntity); //eslint-disable-line
        });
    }

    static _posDelete(deletedEntity, nextTask)
    {
        dbCard.findByIdAndUpdate(deletedEntity.card, {$inc: {numComments: -1}}, {ignoreNonce: true}, (err, data) => nextTask(err, deletedEntity)); //eslint-disable-line
    }

    static _canUpdateOrDeleteComment(req, res, externalNextTask)
    {
        const loggerInfo = new CommentApiLoggerInfo('canUpdateOrDeleteComment');
        const logger = new Logger(req.log);
        const commentId = req.params.id;
        const boardId = req.params.boardId;
        const cardId = req.params.cardId;
        const loggedUserId = req.user._id;
        const dataToLog = {_id: commentId, loggedUser: loggedUserId};
        entityDbManager.findOne({_id: commentId, board: boardId, card: cardId}).lean().exec((err, comment) =>
        {
            if (err)
            {
                logger.exception(err, 'Exception', loggerInfo.create(dataToLog, 'Cant delete/change comment because this is not the author of the comment'));
                return externalNextTask(new AppError(res.__('CANT_DELETE_UPDATE_COMMENT_BECAUSE__DOESNT_BELONG_TO_USER')));
            }
            if (comment && comment.author)
            {
                if (loggedUserId === comment.author.toString())
                {
                    return externalNextTask();
                }
            }
            logger.error('Cant delete/change comment because this is not the author of the comment', loggerInfo.create(dataToLog, 'Cant delete/change comment because this is not the author of the comment'));
            return externalNextTask(new AppError(res.__('CANT_DELETE_UPDATE_COMMENT_BECAUSE__DOESNT_BELONG_TO_USER')));
        });
    }

    findAll(req, res, next) {return CardChildEntity.findAll(req, res, next, {populate: fieldsToPopulate});}
    addData(req, res, next) {return CardChildEntity.addData(req, res, next, {posOperation: CommentApi._posAdd.bind(this), populateAfterSave: fieldsToPopulate});}
    deleteData(req, res, next) {return CardChildEntity.deleteData(req, res, next, {posOperation: CommentApi._posDelete.bind(this), canExecuteActionFn: CommentApi._canUpdateOrDeleteComment.bind(this)});}
    updateData(req, res, next) {return CardChildEntity.updateData(req, res, next, {canExecuteActionFn: CommentApi._canUpdateOrDeleteComment.bind(this), populate: fieldsToPopulate});}

}

const commentApi = new CommentApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/comments', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, commentApi.findAll.bind(commentApi));
	server.post({path: '/boards/:boardId/cards/:cardId/comments', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, commentApi.addData.bind(commentApi));
    server.put({path: '/boards/:boardId/cards/:cardId/comments/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, commentApi.updateData.bind(commentApi));
    server.del({path: '/boards/:boardId/cards/:cardId/comments/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, commentApi.deleteData.bind(commentApi));
};

module.exports.api = new CommentApi();
