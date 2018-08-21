'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/tag');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/tag', entityDbManager);

class TagApi
{
    findAll(req, res, next) { return BoardChildEntity.findAll(req, res, next, {populate: [{path: 'type', select: '_id title avatar'}]});}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const tagApi = new TagApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/tags', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagApi.findAll.bind(tagApi));
    server.get({path: '/boards/:boardId/tags/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagApi.searchByTitle.bind(tagApi));
    server.get({path: '/boards/:boardId/tags/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagApi.findById.bind(tagApi));
	server.post({path: '/boards/:boardId/tags', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagApi.addData.bind(tagApi));
    server.put({path: '/boards/:boardId/tags/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagApi.updateData.bind(tagApi));
    server.del({path: '/boards/:boardId/tags/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagApi.deleteData.bind(tagApi));
};

module.exports.api = new TagApi();
