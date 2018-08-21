'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/project');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/project', entityDbManager);

class ProjectApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options)
    {
        return BoardChildEntity.searchByTitle(req, res, next, options);
    }
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const projectApi = new ProjectApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/projects', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, projectApi.findAll.bind(projectApi));
    server.get({path: '/boards/:boardId/projects/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, projectApi.searchByTitle.bind(projectApi));
    server.get({path: '/boards/:boardId/projects/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, projectApi.findById.bind(projectApi));
	server.post({path: '/boards/:boardId/projects', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, projectApi.addData.bind(projectApi));
    server.put({path: '/boards/:boardId/projects/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, projectApi.updateData.bind(projectApi));
    server.del({path: '/boards/:boardId/projects/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, projectApi.deleteData.bind(projectApi));
};

module.exports.api = new ProjectApi();
