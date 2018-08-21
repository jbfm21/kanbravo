'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/tagCategory');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/tagCategory', entityDbManager);

class TagCategoryApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const tagCategoryApi = new TagCategoryApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/tagCategories', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagCategoryApi.findAll.bind(tagCategoryApi));
    server.get({path: '/boards/:boardId/tagCategories/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagCategoryApi.searchByTitle.bind(tagCategoryApi));
    server.get({path: '/boards/:boardId/tagCategories/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagCategoryApi.findById.bind(tagCategoryApi));
	server.post({path: '/boards/:boardId/tagCategories', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagCategoryApi.addData.bind(tagCategoryApi));
    server.put({path: '/boards/:boardId/tagCategories/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagCategoryApi.updateData.bind(tagCategoryApi));
    server.del({path: '/boards/:boardId/tagCategories/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, tagCategoryApi.deleteData.bind(tagCategoryApi));
};

module.exports.api = new TagCategoryApi();
