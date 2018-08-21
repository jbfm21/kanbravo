'use strict';

const entityDbManager = require('../db/task');
const CardChildEntityClass = require('../api-util/CardChildEntityClass');
const accessControl = require('../api-util/access-control');

const CardChildEntity = new CardChildEntityClass('boards/card/task', entityDbManager);

const fieldsToPopulate = [{path: 'type', select: '_id title avatar'}];

class TaskApi
{
    findAll(req, res, next) {return CardChildEntity.findAll(req, res, next, {sort: {startDate: -1}, populate: fieldsToPopulate});}
    findById(req, res, next) {return CardChildEntity.findById(req, res, next, {populate: fieldsToPopulate});}
    addData(req, res, next) {return CardChildEntity.addData(req, res, next, {populateAfterSave: fieldsToPopulate});}
    deleteData(req, res, next) {return CardChildEntity.deleteData(req, res, next, {forceDelete: true});}
    updateData(req, res, next) {return CardChildEntity.updateData(req, res, next, {populateAfterSave: fieldsToPopulate});}
}

const taskApi = new TaskApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cards/:cardId/tasks', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskApi.findAll.bind(taskApi));
    server.get({path: '/boards/:boardId/cards/:cardId/tasks/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskApi.findById.bind(taskApi));
	server.post({path: '/boards/:boardId/cards/:cardId/tasks', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskApi.addData.bind(taskApi));
    server.put({path: '/boards/:boardId/cards/:cardId/tasks/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskApi.updateData.bind(taskApi));
    server.del({path: '/boards/:boardId/cards/:cardId/tasks/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, taskApi.deleteData.bind(taskApi));
};

module.exports.api = new TaskApi();
