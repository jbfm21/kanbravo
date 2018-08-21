'use strict';
//https://github.com/saintedlama/restify-mongoose
//verificar: http://blog.octo.com/en/design-a-rest-api/
const entityDbManager = require('../db/metric');
const BoardChildEntityClass = require('../api-util/BoardChildEntityClass');
const accessControl = require('../api-util/access-control');

const BoardChildEntity = new BoardChildEntityClass('boards/metric', entityDbManager);

class MetricApi
{
    findAll(req, res, next, options) { return BoardChildEntity.findAll(req, res, next, options);}
    searchByTitle(req, res, next, options) { return BoardChildEntity.searchByTitle(req, res, next, options);}
    findById(req, res, next) {return BoardChildEntity.findById(req, res, next);}
    addData(req, res, next) {return BoardChildEntity.addData(req, res, next);}
    deleteData(req, res, next) {return BoardChildEntity.deleteData(req, res, next);}
    updateData(req, res, next) {return BoardChildEntity.updateData(req, res, next);}
}

const metricApi = new MetricApi();
module.exports = function(server)
{
    server.get({path: '/boards/:boardId/metrics', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, metricApi.findAll.bind(metricApi));
    server.get({path: '/boards/:boardId/metrics/search', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, metricApi.searchByTitle.bind(metricApi));
    server.get({path: '/boards/:boardId/metrics/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, metricApi.findById.bind(metricApi));
	server.post({path: '/boards/:boardId/metrics', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, metricApi.addData.bind(metricApi));
    server.put({path: '/boards/:boardId/metrics/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, metricApi.updateData.bind(metricApi));
    server.del({path: '/boards/:boardId/metrics/:id', version: '1.0.0'}, accessControl.ensureAuthenticated, accessControl.ensureBoardBelongToUser, metricApi.deleteData.bind(metricApi));
};

module.exports.api = new MetricApi();

