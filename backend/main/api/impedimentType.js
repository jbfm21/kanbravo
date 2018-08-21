'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/impedimentType');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/impedimentType', entityDbManager);

class ImpedimentTypeApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const impedimentTypeApi = new ImpedimentTypeApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/impedimentTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentTypeApi.findAll.bind(impedimentTypeApi));
    server.get({path: '/boards/:boardId/impedimentTypes/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentTypeApi.searchByTitle.bind(impedimentTypeApi));
    server.get({path: '/boards/:boardId/impedimentTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentTypeApi.findById.bind(impedimentTypeApi));
	server.post({path: '/boards/:boardId/impedimentTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentTypeApi.addData.bind(impedimentTypeApi));
    server.put({path: '/boards/:boardId/impedimentTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentTypeApi.updateData.bind(impedimentTypeApi));
    server.del({path: '/boards/:boardId/impedimentTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, impedimentTypeApi.deleteData.bind(impedimentTypeApi));
};

module.exports.api = new ImpedimentTypeApi();

