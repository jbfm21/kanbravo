'use strict';
const entityDbManager = require('../db/aging');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/aging', entityDbManager);
class AgingApi
{
    findAll(req, res, next) { return BoardChildEntity.findAll(req, res, next, {populate: [{path: 'type', select: '_id title avatar'}]});}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const agingApi = new AgingApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/agings', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, agingApi.findAll.bind(agingApi));
    server.get({path: '/boards/:boardId/agings/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, agingApi.searchByTitle.bind(agingApi));
    server.get({path: '/boards/:boardId/agings/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, agingApi.findById.bind(agingApi));
	server.post({path: '/boards/:boardId/agings', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, agingApi.addData.bind(agingApi));
    server.put({path: '/boards/:boardId/agings/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, agingApi.updateData.bind(agingApi));
    server.del({path: '/boards/:boardId/agings/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, agingApi.deleteData.bind(agingApi));
};

module.exports.api = new AgingApi();
