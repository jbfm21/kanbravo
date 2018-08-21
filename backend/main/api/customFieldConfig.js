'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/customFieldConfig');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/customFieldConfig', entityDbManager);

class CustomFieldConfigApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    //TODO: não deixar adicionar um campo se ja existir outro do mesmo tipo
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const customFieldConfigApi = new CustomFieldConfigApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/customFieldConfigs', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, customFieldConfigApi.findAll.bind(customFieldConfigApi));
    server.get({path: '/boards/:boardId/customFieldConfigs/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, customFieldConfigApi.searchByTitle.bind(customFieldConfigApi));
    server.get({path: '/boards/:boardId/customFieldConfigs/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, customFieldConfigApi.findById.bind(customFieldConfigApi));
	server.post({path: '/boards/:boardId/customFieldConfigs', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, customFieldConfigApi.addData.bind(customFieldConfigApi));
    server.put({path: '/boards/:boardId/customFieldConfigs/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, customFieldConfigApi.updateData.bind(customFieldConfigApi));
    server.del({path: '/boards/:boardId/customFieldConfigs/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, customFieldConfigApi.deleteData.bind(customFieldConfigApi));
};

module.exports.api = new CustomFieldConfigApi();
