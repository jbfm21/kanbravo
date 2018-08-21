'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/itemType');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');
const BoardChildEntity = new BoardChildEntityClass('boards/itemType', entityDbManager);

class ItemTypeApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const itemTypeApi = new ItemTypeApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/itemTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemTypeApi.findAll.bind(itemTypeApi));
    server.get({path: '/boards/:boardId/itemTypes/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemTypeApi.searchByTitle.bind(itemTypeApi));
    server.get({path: '/boards/:boardId/itemTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemTypeApi.findById.bind(itemTypeApi));
	server.post({path: '/boards/:boardId/itemTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemTypeApi.addData.bind(itemTypeApi));
    server.put({path: '/boards/:boardId/itemTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemTypeApi.updateData.bind(itemTypeApi));
    server.del({path: '/boards/:boardId/itemTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemTypeApi.deleteData.bind(itemTypeApi));
};

module.exports.api = new ItemTypeApi();
