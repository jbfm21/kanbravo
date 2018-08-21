'use strict';

const entityDbManager = require('../db/boardVisualStyle');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/boardVisualStyle', entityDbManager);
class BoardVisualStyleApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}

    fakeFindById(req, res, next) {return res.json({data: {}});}; //eslint-disable-line
}

const boardVisualStyleApi = new BoardVisualStyleApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/visualStyles', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardVisualStyleApi.findAll.bind(boardVisualStyleApi));
    //TODO server.get({path: '/boards/:boardId/visualStyles/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardVisualStyleApi.findById.bind(boardVisualStyleApi));
    server.get({path: '/boards/:boardId/visualStyles/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardVisualStyleApi.fakeFindById.bind(boardVisualStyleApi));
	server.post({path: '/boards/:boardId/visualStyles', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardVisualStyleApi.addData.bind(boardVisualStyleApi));
    server.put({path: '/boards/:boardId/visualStyles/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardVisualStyleApi.updateData.bind(boardVisualStyleApi));
    server.del({path: '/boards/:boardId/visualStyles/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, boardVisualStyleApi.deleteData.bind(boardVisualStyleApi));
};

module.exports.api = new BoardVisualStyleApi();
