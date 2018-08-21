'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/classOfService');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/classOfService', entityDbManager);

class ClassOfServiceApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const classOfServiceApi = new ClassOfServiceApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/classOfServices', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, classOfServiceApi.findAll.bind(classOfServiceApi));
    server.get({path: '/boards/:boardId/classOfServices/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, classOfServiceApi.searchByTitle.bind(classOfServiceApi));
    server.get({path: '/boards/:boardId/classOfServices/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, classOfServiceApi.findById.bind(classOfServiceApi));
	server.post({path: '/boards/:boardId/classOfServices', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, classOfServiceApi.addData.bind(classOfServiceApi));
    server.put({path: '/boards/:boardId/classOfServices/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, classOfServiceApi.updateData.bind(classOfServiceApi));
    server.del({path: '/boards/:boardId/classOfServices/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, classOfServiceApi.deleteData.bind(classOfServiceApi));
};

module.exports.api = new ClassOfServiceApi();
