'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/itemSize');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/itemSize', entityDbManager);

class ItemSizeApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const itemSizeApi = new ItemSizeApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/itemSizes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemSizeApi.findAll.bind(itemSizeApi));
    server.get({path: '/boards/:boardId/itemSizes/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemSizeApi.searchByTitle.bind(itemSizeApi));
    server.get({path: '/boards/:boardId/itemSizes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemSizeApi.findById.bind(itemSizeApi));
	server.post({path: '/boards/:boardId/itemSizes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemSizeApi.addData.bind(itemSizeApi));
    server.put({path: '/boards/:boardId/itemSizes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemSizeApi.updateData.bind(itemSizeApi));
    server.del({path: '/boards/:boardId/itemSizes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, itemSizeApi.deleteData.bind(itemSizeApi));
};

module.exports.api = new ItemSizeApi();
