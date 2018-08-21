'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/priority');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/priority', entityDbManager);

class PriorityApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const priorityApi = new PriorityApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/priorities', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, priorityApi.findAll.bind(priorityApi));
    server.get({path: '/boards/:boardId/priorities/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, priorityApi.searchByTitle.bind(priorityApi));
    server.get({path: '/boards/:boardId/priorities/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, priorityApi.findById.bind(priorityApi));
	server.post({path: '/boards/:boardId/priorities', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, priorityApi.addData.bind(priorityApi));
    server.put({path: '/boards/:boardId/priorities/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, priorityApi.updateData.bind(priorityApi));
    server.del({path: '/boards/:boardId/priorities/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, priorityApi.deleteData.bind(priorityApi));
};

module.exports.api = new PriorityApi();
