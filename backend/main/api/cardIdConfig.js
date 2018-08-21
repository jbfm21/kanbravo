'use strict';

const entityDbManager = require('../db/cardIdConfig');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/cardIdConfig', entityDbManager);

class CardIdConfigApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const cardIdConfigApi = new CardIdConfigApi();

module.exports = function(server)
{
    server.get({path: '/boards/:boardId/cardIdConfigs', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardIdConfigApi.findAll.bind(cardIdConfigApi));
    server.get({path: '/boards/:boardId/cardIdConfigs/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardIdConfigApi.searchByTitle.bind(cardIdConfigApi));
    server.get({path: '/boards/:boardId/cardIdConfigs/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardIdConfigApi.findById.bind(cardIdConfigApi));
	server.post({path: '/boards/:boardId/cardIdConfigs', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardIdConfigApi.addData.bind(cardIdConfigApi));
    server.put({path: '/boards/:boardId/cardIdConfigs/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardIdConfigApi.updateData.bind(cardIdConfigApi));
    server.del({path: '/boards/:boardId/cardIdConfigs/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, cardIdConfigApi.deleteData.bind(cardIdConfigApi));
};

module.exports.api = new CardIdConfigApi();
