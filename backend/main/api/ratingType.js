'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/ratingType');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/ratingType', entityDbManager);

class RatingTypeApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const ratingTypeApi = new RatingTypeApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/ratingTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, ratingTypeApi.findAll.bind(ratingTypeApi));
    server.get({path: '/boards/:boardId/ratingTypes/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, ratingTypeApi.searchByTitle.bind(ratingTypeApi));
    server.get({path: '/boards/:boardId/ratingTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, ratingTypeApi.findById.bind(ratingTypeApi));
	server.post({path: '/boards/:boardId/ratingTypes', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, ratingTypeApi.addData.bind(ratingTypeApi));
    server.put({path: '/boards/:boardId/ratingTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, ratingTypeApi.updateData.bind(ratingTypeApi));
    server.del({path: '/boards/:boardId/ratingTypes/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, ratingTypeApi.deleteData.bind(ratingTypeApi));
};

module.exports.api = new RatingTypeApi();
