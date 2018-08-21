'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/taskType');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/taskType', entityDbManager);

class TaskTypeApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const taskTypeApi = new TaskTypeApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/taskTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskTypeApi.findAll.bind(taskTypeApi));
    server.get({path: '/boards/:boardId/taskTypes/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskTypeApi.searchByTitle.bind(taskTypeApi));
    server.get({path: '/boards/:boardId/taskTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskTypeApi.findById.bind(taskTypeApi));
	server.post({path: '/boards/:boardId/taskTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskTypeApi.addData.bind(taskTypeApi));
    server.put({path: '/boards/:boardId/taskTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskTypeApi.updateData.bind(taskTypeApi));
    server.del({path: '/boards/:boardId/taskTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskTypeApi.deleteData.bind(taskTypeApi));
};

module.exports.api = new TaskTypeApi();

